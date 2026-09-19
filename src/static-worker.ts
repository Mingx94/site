import { prefersMarkdown } from "./lib/accept";

export default {
  async fetch(request: Request, env: StaticEnv) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cmsRoute =
      path === "/_emdash" ||
      path.startsWith("/_emdash/") ||
      path.startsWith("/_site/") ||
      path.startsWith("/covers/") ||
      path === "/_image" ||
      (path.startsWith("/blog/") && url.searchParams.has("_preview"));
    if (cmsRoute) return env.CMS.fetch(request);

    const article = /^\/blog\/([^/]+?)\/?$/.exec(path)?.[1];
    const markdown =
      article &&
      !article.endsWith(".md") &&
      prefersMarkdown(request.headers.get("accept"));
    if (markdown) url.pathname = `/blog/${article}.md`;
    const asset = await env.ASSETS.fetch(new Request(url, request));
    // EmDash's admin and preview use their own hashed JS/CSS assets.
    if (asset.status === 404 && path.startsWith("/_astro/"))
      return env.CMS.fetch(request);

    const response = new Response(asset.body, asset);
    if (article) {
      response.headers.append("Vary", "Accept");
      if (markdown || article.endsWith(".md"))
        response.headers.set("Content-Type", "text/markdown; charset=utf-8");
      else
        response.headers.set(
          "Link",
          `</blog/${article}.md>; rel="alternate"; type="text/markdown"`,
        );
    }
    if (response.status >= 400)
      response.headers.set("Cache-Control", "no-store");
    return response;
  },
} satisfies ExportedHandler<StaticEnv>;
