import { describe, expect, it, vi } from "vitest";
import {
  COVER_WIDTHS,
  coverDeliveryUrl,
  coverVariantKey,
  createCoverVariantJob,
  generateCoverVariants,
  isCoverVariantJob,
  type CoverVariantDependencies,
  type CoverVariantJob,
} from "./coverVariants";

const job: CoverVariantJob = {
  kind: "cover-variants",
  contentId: "article-1",
  mediaId: "media-1",
  sourceKey: "01TEST.webp",
};

function dependencies(
  overrides: Partial<CoverVariantDependencies> = {},
): CoverVariantDependencies {
  return {
    listKeys: vi
      .fn<CoverVariantDependencies["listKeys"]>()
      .mockResolvedValue([]),
    readSource: vi
      .fn<CoverVariantDependencies["readSource"]>()
      .mockResolvedValue({ bytes: new ArrayBuffer(4), size: 4 }),
    transform: vi
      .fn<CoverVariantDependencies["transform"]>()
      .mockImplementation(async () => ({
        body: new ReadableStream<Uint8Array>(),
        contentType: "image/webp",
      })),
    writeVariant: vi
      .fn<CoverVariantDependencies["writeVariant"]>()
      .mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("cover variant jobs", () => {
  it("builds a delivery URL with an encoded content ID", () => {
    expect(coverDeliveryUrl("article 1", "media-1", 750)).toBe(
      "/covers/article%201/media-1/750.webp",
    );
  });

  it("creates a job for a local post cover", () => {
    expect(
      createCoverVariantJob("posts", {
        id: "article-1",
        data: {
          featured_image: {
            id: "media-1",
            provider: "local",
            mimeType: "image/jpeg",
            meta: { storageKey: "01TEST.jpg" },
          },
        },
      }),
    ).toEqual({
      kind: "cover-variants",
      contentId: "article-1",
      mediaId: "media-1",
      sourceKey: "01TEST.jpg",
    });
  });

  it("rejects external media and protected storage keys", () => {
    expect(
      createCoverVariantJob("posts", {
        id: "article-1",
        data: {
          featured_image: {
            id: "media-1",
            provider: "external",
            src: "https://example.com/a.jpg",
          },
        },
      }),
    ).toBeNull();
    expect(
      createCoverVariantJob("posts", {
        id: "article-1",
        data: {
          featured_image: {
            id: "media-1",
            src: "https://example.com/a.jpg",
          },
        },
      }),
    ).toBeNull();
    expect(isCoverVariantJob({ ...job, sourceKey: "backups/site.zip" })).toBe(
      false,
    );
  });

  it("generates only missing responsive widths", async () => {
    const existingKey = coverVariantKey(job.mediaId, COVER_WIDTHS[0]);
    const deps = dependencies({
      listKeys: vi
        .fn<CoverVariantDependencies["listKeys"]>()
        .mockResolvedValue([existingKey]),
    });

    await expect(generateCoverVariants(job, deps)).resolves.toEqual({
      generated: COVER_WIDTHS.length - 1,
      skipped: 1,
    });
    expect(deps.readSource).toHaveBeenCalledOnce();
    expect(deps.transform).toHaveBeenCalledTimes(COVER_WIDTHS.length - 1);
    expect(deps.writeVariant).toHaveBeenCalledTimes(COVER_WIDTHS.length - 1);
    expect(deps.writeVariant).not.toHaveBeenCalledWith(
      existingKey,
      expect.anything(),
      expect.anything(),
    );
  });

  it("skips an already completed idempotent job", async () => {
    const deps = dependencies({
      listKeys: vi
        .fn<CoverVariantDependencies["listKeys"]>()
        .mockResolvedValue(
          COVER_WIDTHS.map((width) => coverVariantKey(job.mediaId, width)),
        ),
    });

    await expect(generateCoverVariants(job, deps)).resolves.toEqual({
      generated: 0,
      skipped: COVER_WIDTHS.length,
    });
    expect(deps.readSource).not.toHaveBeenCalled();
    expect(deps.transform).not.toHaveBeenCalled();
  });

  it("marks a missing source as a permanent error", async () => {
    const deps = dependencies({
      readSource: vi
        .fn<CoverVariantDependencies["readSource"]>()
        .mockResolvedValue(null),
    });

    await expect(generateCoverVariants(job, deps)).rejects.toMatchObject({
      name: "CoverVariantError",
      retryable: false,
    });
  });
});
