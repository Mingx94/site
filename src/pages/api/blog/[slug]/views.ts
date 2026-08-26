import { getViews, trackView } from "@/lib/server/blog";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

const json = (body: unknown) =>
  Response.json(body, { headers: { "Cache-Control": "private, no-store" } });

export const GET: APIRoute = async ({ params }) =>
  json({ views: await getViews(env.BLOG_KV, params.slug ?? "") });

export const POST: APIRoute = async ({ params, request }) => {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  return json({
    views: await trackView(env, params.slug ?? "", ip),
  });
};
