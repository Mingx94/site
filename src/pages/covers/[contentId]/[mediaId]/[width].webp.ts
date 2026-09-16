import type { APIRoute } from "astro";
import { env, waitUntil } from "cloudflare:workers";
import {
  CoverVariantError,
  MAX_COVER_SOURCE_BYTES,
  coverVariantKey,
} from "@/lib/coverVariants";
import { getPost } from "@/lib/posts";

export const prerender = false;

const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

function mediaPath(sourceKey: string): string {
  return `/_emdash/api/media/file/${sourceKey
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function fallbackResponse(request: Request, sourceKey: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(mediaPath(sourceKey), request.url).href,
      "Cache-Control": "no-store",
    },
  });
}

function imageResponse(
  body: ReadableStream<Uint8Array>,
  contentType: string,
  size?: number,
): Response {
  const headers = new Headers({
    "Cache-Control": IMMUTABLE_CACHE,
    "Content-Disposition": "inline",
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
  });
  if (size !== undefined) headers.set("Content-Length", String(size));
  return new Response(body, { headers });
}

export const GET: APIRoute = async ({ params, request }) => {
  const contentId = params.contentId ?? "";
  const mediaId = params.mediaId ?? "";
  const width = Number(params.width);

  if (!contentId || contentId.length > 256 || !Number.isInteger(width)) {
    return new Response("Not found", { status: 404 });
  }

  let variantKey: string;
  try {
    variantKey = coverVariantKey(mediaId, width);
  } catch (error) {
    if (error instanceof CoverVariantError) {
      return new Response("Not found", { status: 404 });
    }
    throw error;
  }

  const existing = await env.MEDIA.get(variantKey);
  if (existing) {
    return imageResponse(
      existing.body,
      existing.httpMetadata?.contentType ?? "image/webp",
      existing.size,
    );
  }

  const post = await getPost(contentId);
  if (
    !post ||
    post.draft ||
    post.coverMediaId !== mediaId ||
    typeof post.coverStorageKey !== "string"
  ) {
    return new Response("Not found", { status: 404 });
  }
  const sourceKey = post.coverStorageKey;
  const source = await env.MEDIA.get(sourceKey);
  if (!source) return new Response("Not found", { status: 404 });
  if (source.size > MAX_COVER_SOURCE_BYTES) {
    return fallbackResponse(request, sourceKey);
  }

  try {
    const transformed = await env.IMAGES.input(source.body)
      .transform({ width, fit: "scale-down" })
      .output({ format: "image/webp", quality: 82 });
    const storageResponse = transformed.response({
      headers: {
        "Cache-Control": IMMUTABLE_CACHE,
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
      },
    });
    const clientResponse = storageResponse.clone();
    const storageBody = storageResponse.body;
    if (!storageBody) throw new Error("Transformed cover has no response body");
    const contentType =
      storageResponse.headers.get("Content-Type") ?? transformed.contentType();
    const storage = env.MEDIA.put(variantKey, storageBody, {
      httpMetadata: {
        contentType,
        cacheControl: IMMUTABLE_CACHE,
      },
      customMetadata: {
        mediaId,
        sourceKey,
        width: String(width),
      },
    })
      .then((result) => {
        if (!result)
          throw new Error(`Failed to store cover variant: ${variantKey}`);
      })
      .catch((error: unknown) => {
        console.error(
          JSON.stringify({
            event: "cover_variant_delivery_store_failed",
            variantKey,
            error: error instanceof Error ? error.message : String(error),
          }),
        );
      });

    waitUntil(storage);
    return clientResponse;
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "cover_variant_delivery_transform_failed",
        variantKey,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return fallbackResponse(request, sourceKey);
  }
};
