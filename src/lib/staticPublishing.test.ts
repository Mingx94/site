import { afterEach, describe, expect, it, vi } from "vitest";
import { needsStaticRebuild, triggerStaticBuild } from "./staticPublishing";

afterEach(() => vi.unstubAllGlobals());

describe("static publication triggers", () => {
  it.each([
    "/_emdash/api/taxonomies/tag/terms/x",
    "/_emdash/api/content/posts/x/terms",
    "/_emdash/api/media/x",
  ])("rebuilds after a successful mutation to %s", (path) => {
    expect(
      needsStaticRebuild(
        new Request(`https://vartifact.cc${path}`, { method: "PATCH" }),
        new Response(),
      ),
    ).toBe(true);
  });
  it("ignores reads, rejected writes and autosaves", () => {
    const url = "https://vartifact.cc/_emdash/api/media/x";
    expect(needsStaticRebuild(new Request(url), new Response())).toBe(false);
    expect(
      needsStaticRebuild(
        new Request(url, { method: "DELETE" }),
        new Response(null, { status: 403 }),
      ),
    ).toBe(false);
    expect(
      needsStaticRebuild(
        new Request("https://vartifact.cc/_emdash/api/content/posts/x", {
          method: "PATCH",
        }),
        new Response(),
      ),
    ).toBe(false);
  });
  it("rejects failed dispatches so the queue retries", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 })),
    );
    await expect(
      triggerStaticBuild(
        "https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/test",
      ),
    ).rejects.toThrow("503");
  });
  it("requires an accepted build ID rather than merely HTTP 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ success: false })),
    );
    await expect(
      triggerStaticBuild(
        "https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/test",
      ),
    ).rejects.toThrow("not accepted");
  });
});
