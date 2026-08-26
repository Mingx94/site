import { changeReaction, getReactions } from "@/lib/server/blog";
import { getPost } from "@/lib/posts";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

const response = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug ?? "";
  if (!(await getPost(slug))) return response({ error: "Not found" }, 404);
  return response(await getReactions(env, slug));
};

export const POST: APIRoute = async ({ params, request }) => {
  const body = (await request.json().catch(() => null)) as {
    emoji?: string;
    action?: string;
  } | null;
  if (!body?.emoji || (body.action !== "add" && body.action !== "remove")) {
    return response({ error: "Invalid reaction" }, 400);
  }
  const slug = params.slug ?? "";
  if (!(await getPost(slug))) return response({ error: "Not found" }, 404);
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  return response(await changeReaction(env, slug, body.emoji, body.action, ip));
};
