import { describe, expect, it, vi } from "vitest";
import worker from "./static-worker";

function setup() {
  const assets = vi.fn<(request: Request) => Promise<Response>>(
    async () =>
      new Response("static article", {
        headers: { "Content-Type": "text/html" },
      }),
  );
  const cms = vi.fn<(request: Request) => Promise<Response>>(
    async () => new Response("cms"),
  );
  const env = {
    ASSETS: { fetch: assets },
    CMS: { fetch: cms },
  } as unknown as StaticEnv;
  return { assets, cms, env };
}

describe("static public Worker", () => {
  it("serves an article without invoking EmDash, even with a login cookie", async () => {
    const { assets, cms, env } = setup();
    const response = await worker.fetch(
      new Request("https://vartifact.cc/blog/post", {
        headers: { cookie: "astro-session=abc" },
      }),
      env,
    );
    expect(await response.text()).toBe("static article");
    expect(assets).toHaveBeenCalledOnce();
    expect(cms).not.toHaveBeenCalled();
    expect(response.headers.get("Vary")).toBe("Accept");
  });

  it("serves the prebuilt Markdown variant for negotiated requests", async () => {
    const { assets, cms, env } = setup();
    const response = await worker.fetch(
      new Request("https://vartifact.cc/blog/post?x=1", {
        headers: { Accept: "text/markdown" },
      }),
      env,
    );
    const request = assets.mock.calls[0]?.[0] as Request | undefined;
    expect(request?.url).toBe("https://vartifact.cc/blog/post.md?x=1");
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(cms).not.toHaveBeenCalled();
  });

  it.each([
    "/_emdash/admin",
    "/_emdash/api/content/posts",
    "/_site/snapshot.json",
    "/blog/post?_preview=signed",
    "/covers/post/media/640.webp",
  ])("preserves the CMS request for %s", async (path) => {
    const { assets, cms, env } = setup();
    const request = new Request(`https://vartifact.cc${path}`, {
      headers: { cookie: "astro-session=abc" },
    });
    await worker.fetch(request, env);
    expect(cms).toHaveBeenCalledExactlyOnceWith(request);
    expect(assets).not.toHaveBeenCalled();
  });

  it("keeps unpublished or nonexistent public pages as static 404s", async () => {
    const { assets, cms, env } = setup();
    assets.mockResolvedValue(new Response("not found", { status: 404 }));
    const response = await worker.fetch(
      new Request("https://vartifact.cc/blog/removed"),
      env,
    );
    expect(response.status).toBe(404);
    expect(cms).not.toHaveBeenCalled();
  });

  it("fetches admin assets from the CMS only when absent from the static build", async () => {
    const { assets, cms, env } = setup();
    assets.mockResolvedValue(new Response(null, { status: 404 }));
    await worker.fetch(
      new Request("https://vartifact.cc/_astro/admin.js"),
      env,
    );
    expect(cms).toHaveBeenCalledOnce();
  });
});
