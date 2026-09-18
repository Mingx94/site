import { describe, expect, it, vi } from "vitest";
import type { APIContext } from "astro";
import { invalidateTaxonomyPages } from "./pageCache";

describe("taxonomy page cache invalidation", () => {
  it.each([
    ["PUT", "/_emdash/api/taxonomies/tag/terms/old-slug?locale=zh-TW"],
    ["DELETE", "/_emdash/api/taxonomies/tag/terms/old-slug"],
    ["POST", "/_emdash/api/taxonomies/tag/terms"],
    ["DELETE", "/_emdash/api/taxonomies/tag"],
    ["PUT", "/_emdash/api/content/posts/post-id/terms/tag"],
  ])(
    "invalidates all post representations after %s %s",
    async (method, path) => {
      const cache = {
        invalidate: vi
          .fn<APIContext["cache"]["invalidate"]>()
          .mockResolvedValue(undefined),
      };
      const response = Response.json({ success: true, data: {} });
      await invalidateTaxonomyPages(
        new Request(`https://vartifact.cc${path}`, { method }),
        response,
        cache,
      );
      expect(cache.invalidate).toHaveBeenCalledExactlyOnceWith({
        tags: ["posts"],
      });
      // Inspecting the mutation result must not consume the admin response body.
      await expect(response.json()).resolves.toMatchObject({ success: true });
    },
  );

  it.each([400, 401, 403, 404, 409, 500, 302])(
    "does not invalidate for an unsuccessful mutation (%i)",
    async (status) => {
      const cache = { invalidate: vi.fn<APIContext["cache"]["invalidate"]>() };
      await invalidateTaxonomyPages(
        new Request(
          "https://vartifact.cc/_emdash/api/taxonomies/tag/terms/astro",
          {
            method: "PUT",
          },
        ),
        new Response(null, { status }),
        cache,
      );
      expect(cache.invalidate).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["GET", "/_emdash/api/taxonomies/tag/terms"],
    ["HEAD", "/_emdash/api/taxonomies/tag/terms"],
    ["OPTIONS", "/_emdash/api/taxonomies/tag/terms"],
    ["PUT", "/_emdash/api/content/pages/page-id/terms/tag"],
    ["PUT", "/_emdash/api/content/posts/post-id"],
    ["POST", "/_emdash/api/taxonomies-other"],
    ["POST", "/_emdash/api/content/posts/post-id/terms-other"],
    ["POST", "/blog/example"],
  ])("leaves other requests alone: %s %s", async (method, path) => {
    const cache = { invalidate: vi.fn<APIContext["cache"]["invalidate"]>() };
    await invalidateTaxonomyPages(
      new Request(`https://vartifact.cc${path}`, { method }),
      new Response(null, { status: 200 }),
      cache,
    );
    expect(cache.invalidate).not.toHaveBeenCalled();
  });
});
