import { getViews, trackView } from "@/lib/server/blog";
import { getPost } from "@/lib/posts";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug ?? "";
  if (!(await getPost(slug))) return json({ error: "Not found" }, 404);
  return json({ views: await getViews(env, slug) });
};

export const POST: APIRoute = async ({ params, request }) => {
  const slug = params.slug ?? "";
  if (!(await getPost(slug))) return json({ error: "Not found" }, 404);
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  return json({
    views: await trackView(env, slug, ip),
  });
};
