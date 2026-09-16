import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEmDashEntry:
    vi.fn<(collection: string, slug: string) => Promise<unknown>>(),
}));

vi.mock("emdash", () => ({
  getEmDashCollection: vi.fn<() => Promise<unknown>>(),
  getEmDashEntry: mocks.getEmDashEntry,
}));

import { getPost, getTags } from "./posts";

describe("getPost", () => {
  it("maps EmDash tag labels and slugs without treating categories as tags", async () => {
    mocks.getEmDashEntry.mockResolvedValue({
      entry: {
        id: "tagged",
        data: {
          terms: {
            tag: [{ slug: "astro", label: "Astro", name: "tag" }],
            category: [{ slug: "notes", label: "筆記", name: "category" }],
          },
        },
      },
      error: null,
    });
    const post = await getPost("tagged");
    expect(post?.tags).toEqual([{ slug: "astro", name: "Astro" }]);
    expect(
      getTags([
        post!,
        { ...post!, id: "another", tags: [...post!.tags, ...post!.tags] },
      ]),
    ).toEqual([{ slug: "astro", name: "Astro", count: 2 }]);
  });

  it("supports existing articles without tags", async () => {
    mocks.getEmDashEntry.mockResolvedValue({
      entry: { id: "untagged", data: {} },
      error: null,
    });
    const post = await getPost("untagged");
    expect(post?.tags).toEqual([]);
    expect(getTags([post!])).toEqual([]);
  });

  it("preserves the featured image alt text", async () => {
    mocks.getEmDashEntry.mockResolvedValue({
      entry: {
        id: "article",
        data: {
          title: "Article title",
          featured_image: {
            id: "media-id",
            alt: "A riverside park under a blue sky",
            meta: { storageKey: "cover.jpg" },
          },
        },
      },
      error: null,
    });

    await expect(getPost("article")).resolves.toMatchObject({
      cover: "/_emdash/api/media/file/cover.jpg",
      coverAlt: "A riverside park under a blue sky",
      coverMediaId: "media-id",
      coverStorageKey: "cover.jpg",
    });
  });

  it("preserves EmDash SEO settings", async () => {
    const seo = {
      title: "SEO title",
      description: "SEO description",
      image: "seo-image-id",
      canonical: "https://example.com/canonical",
      noIndex: true,
    };
    mocks.getEmDashEntry.mockResolvedValue({
      entry: {
        id: "article",
        data: {
          title: "Article title",
          seo,
        },
      },
      error: null,
    });

    await expect(getPost("article")).resolves.toMatchObject({ seo });
  });
});
