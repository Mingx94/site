import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEmDashEntry:
    vi.fn<(collection: string, slug: string) => Promise<unknown>>(),
}));

vi.mock("emdash", () => ({
  getEmDashCollection: vi.fn<() => Promise<unknown>>(),
  getEmDashEntry: mocks.getEmDashEntry,
}));

import { getPost } from "./posts";

describe("getPost", () => {
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
    });
  });
});
