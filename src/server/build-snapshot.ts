import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { timingSafeEqual } from "node:crypto";
import { getPosts } from "../lib/posts";

export const prerender = false;

export const GET: APIRoute = async ({ request, cache }) => {
  cache.set(false);
  const supplied = Buffer.from(
    request.headers.get("x-static-build-token") ?? "",
  );
  const expected = Buffer.from(env.STATIC_BUILD_TOKEN ?? "");
  if (
    !expected.length ||
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }
  const posts = await getPosts();
  if (posts.some((post) => post.draft))
    throw new Error("Draft in published snapshot");
  return Response.json(
    { version: 1, generatedAt: new Date().toISOString(), posts },
    {
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    },
  );
};
