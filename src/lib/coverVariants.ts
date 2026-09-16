export const COVER_WIDTHS = [320, 480, 640, 750, 960, 1280, 1600] as const;

export const COVER_VARIANT_PREFIX = "derived/covers";

export const MAX_COVER_SOURCE_BYTES = 20 * 1024 * 1024;
const SAFE_MEDIA_ID = /^[A-Za-z0-9_-]{1,128}$/;

export interface CoverVariantJob {
  kind: "cover-variants";
  contentId: string;
  mediaId: string;
  sourceKey: string;
}

export interface CoverSource {
  mediaId: string;
  storageKey: string;
}

interface CoverVariantSource {
  bytes: ArrayBuffer;
  size: number;
}

interface CoverVariantOutput {
  body: ReadableStream<Uint8Array>;
  contentType: string;
}

export interface CoverVariantDependencies {
  listKeys(prefix: string): Promise<string[]>;
  readSource(key: string): Promise<CoverVariantSource | null>;
  transform(source: ArrayBuffer, width: number): Promise<CoverVariantOutput>;
  writeVariant(
    key: string,
    output: CoverVariantOutput,
    metadata: { mediaId: string; sourceKey: string; width: number },
  ): Promise<void>;
}

export class CoverVariantError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "CoverVariantError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSafeSourceKey(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 1024 &&
    !value.startsWith("/") &&
    !value.startsWith("backups/") &&
    !value.startsWith(`${COVER_VARIANT_PREFIX}/`) &&
    !value.split("/").includes("..")
  );
}

export function getLocalCoverSource(value: unknown): CoverSource | null {
  if (!isRecord(value)) return null;
  if (value.provider === "external") return null;
  if (typeof value.src === "string") return null;
  if (
    typeof value.mimeType === "string" &&
    !value.mimeType.startsWith("image/")
  )
    return null;

  const mediaId = typeof value.id === "string" ? value.id : "";
  if (!SAFE_MEDIA_ID.test(mediaId)) return null;

  const meta = isRecord(value.meta) ? value.meta : undefined;
  const storageKey =
    typeof meta?.storageKey === "string" ? meta.storageKey : mediaId;
  if (!isSafeSourceKey(storageKey)) return null;

  return { mediaId, storageKey };
}

export function createCoverVariantJob(
  collection: string,
  content: Record<string, unknown>,
): CoverVariantJob | null {
  if (collection !== "posts" || typeof content.id !== "string") return null;
  const data = isRecord(content.data) ? content.data : null;
  const source = getLocalCoverSource(data?.featured_image);
  if (!source) return null;

  return {
    kind: "cover-variants",
    contentId: content.id,
    mediaId: source.mediaId,
    sourceKey: source.storageKey,
  };
}

export function isCoverVariantJob(value: unknown): value is CoverVariantJob {
  if (!isRecord(value) || value.kind !== "cover-variants") return false;
  if (
    typeof value.contentId !== "string" ||
    value.contentId.length === 0 ||
    value.contentId.length > 256
  )
    return false;
  if (typeof value.mediaId !== "string" || !SAFE_MEDIA_ID.test(value.mediaId))
    return false;
  return (
    typeof value.sourceKey === "string" && isSafeSourceKey(value.sourceKey)
  );
}

export function coverVariantKey(mediaId: string, width: number): string {
  if (
    !SAFE_MEDIA_ID.test(mediaId) ||
    !COVER_WIDTHS.includes(width as (typeof COVER_WIDTHS)[number])
  ) {
    throw new CoverVariantError("Invalid cover variant key", false);
  }
  return `${COVER_VARIANT_PREFIX}/${mediaId}/${width}.webp`;
}

export function coverDeliveryUrl(
  contentId: string,
  mediaId: string,
  width: number,
): string {
  coverVariantKey(mediaId, width);
  if (!contentId || contentId.length > 256) {
    throw new CoverVariantError("Invalid cover content ID", false);
  }
  return `/covers/${encodeURIComponent(contentId)}/${mediaId}/${width}.webp`;
}

export async function generateCoverVariants(
  job: CoverVariantJob,
  dependencies: CoverVariantDependencies,
): Promise<{ generated: number; skipped: number }> {
  if (!isCoverVariantJob(job)) {
    throw new CoverVariantError("Invalid cover variant job", false);
  }

  const prefix = `${COVER_VARIANT_PREFIX}/${job.mediaId}/`;
  const existing = new Set(await dependencies.listKeys(prefix));
  const missing = COVER_WIDTHS.filter(
    (width) => !existing.has(coverVariantKey(job.mediaId, width)),
  );
  if (missing.length === 0)
    return { generated: 0, skipped: COVER_WIDTHS.length };

  const source = await dependencies.readSource(job.sourceKey);
  if (!source) {
    throw new CoverVariantError(
      `Cover source not found: ${job.sourceKey}`,
      false,
    );
  }
  if (source.size > MAX_COVER_SOURCE_BYTES) {
    throw new CoverVariantError(
      `Cover source exceeds ${MAX_COVER_SOURCE_BYTES} bytes`,
      false,
    );
  }

  for (const width of missing) {
    const output = await dependencies.transform(source.bytes, width);
    await dependencies.writeVariant(
      coverVariantKey(job.mediaId, width),
      output,
      {
        mediaId: job.mediaId,
        sourceKey: job.sourceKey,
        width,
      },
    );
  }

  return {
    generated: missing.length,
    skipped: COVER_WIDTHS.length - missing.length,
  };
}

export function createCloudflareCoverDependencies(
  env: Pick<Env, "IMAGES" | "MEDIA">,
): CoverVariantDependencies {
  return {
    async listKeys(prefix) {
      const result = await env.MEDIA.list({ prefix });
      return result.objects.map((item) => item.key);
    },
    async readSource(key) {
      const object = await env.MEDIA.get(key);
      if (!object) return null;
      return { bytes: await object.arrayBuffer(), size: object.size };
    },
    async transform(source, width) {
      const result = await env.IMAGES.input(new Blob([source]).stream())
        .transform({ width, fit: "scale-down" })
        .output({ format: "image/webp", quality: 82 });
      return { body: result.image(), contentType: result.contentType() };
    },
    async writeVariant(key, output, metadata) {
      const result = await env.MEDIA.put(key, output.body, {
        httpMetadata: {
          contentType: output.contentType,
          cacheControl: "public, max-age=31536000, immutable",
        },
        customMetadata: {
          mediaId: metadata.mediaId,
          sourceKey: metadata.sourceKey,
          width: String(metadata.width),
        },
      });
      if (!result) throw new Error(`Failed to store cover variant: ${key}`);
    },
  };
}
