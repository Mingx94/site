import type { APIContext } from "astro";

const TAXONOMY_API = /^\/_emdash\/api\/taxonomies(?:\/|$)/;
const POST_TERMS_API = /^\/_emdash\/api\/content\/posts\/[^/]+\/terms(?:\/|$)/;
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** EmDash clears its term cache, but these routes do not invalidate page HTML. */
export async function invalidateTaxonomyPages(
  request: Request,
  response: Response,
  cache: Pick<APIContext["cache"], "invalidate">,
): Promise<void> {
  if (!WRITE_METHODS.has(request.method) || !response.ok) return;
  const { pathname } = new URL(request.url);
  if (TAXONOMY_API.test(pathname) || POST_TERMS_API.test(pathname)) {
    // Includes lists, article HTML/Markdown, feeds, and both old/new tag URLs.
    await cache.invalidate({ tags: ["posts"] });
  }
}
