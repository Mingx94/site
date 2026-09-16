import { describe, expect, it } from "vitest";
import type { Post } from "./posts";
import { resolvePostSeo } from "./postSeo";

const basePost: Post = {
  id: "article",
  title: "Article title",
  description: "Article description",
  date: "2026-09-16T00:00:00.000Z",
  readingTime: 1,
  content: [],
  tags: [],
};

describe("resolvePostSeo", () => {
  it("uses EmDash SEO settings", () => {
    const meta = resolvePostSeo(
      {
        ...basePost,
        seo: {
          title: "SEO title",
          description: "SEO description",
          image: "seo-image-id",
          canonical: "https://example.com/canonical",
          noIndex: true,
        },
      },
      {
        path: "/blog/article",
        siteUrl: new URL("https://vartifact.cc"),
      },
    );

    expect(meta).toEqual({
      title: "SEO title | Vartifact",
      description: "SEO description",
      ogTitle: "SEO title",
      ogDescription: "SEO description",
      ogImage: "https://vartifact.cc/_emdash/api/media/file/seo-image-id",
      canonical: "https://example.com/canonical",
      robots: "noindex, nofollow",
    });
  });

  it("falls back to the article fields and cover", () => {
    const meta = resolvePostSeo(
      { ...basePost, cover: "/media/cover.jpg" },
      {
        path: "/blog/article",
        siteUrl: new URL("https://vartifact.cc"),
      },
    );

    expect(meta).toEqual({
      title: "Article title | Vartifact",
      description: "Article description",
      ogTitle: "Article title",
      ogDescription: "Article description",
      ogImage: "https://vartifact.cc/media/cover.jpg",
      canonical: "https://vartifact.cc/blog/article",
      robots: null,
    });
  });
});
