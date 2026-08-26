import { changeReaction, getReactions } from "@/lib/server/blog";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

const response = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

export const GET: APIRoute = async ({ params }) =>
  response(await getReactions(env.BLOG_KV, params.slug ?? ""));

export const POST: APIRoute = async ({ params, request }) => {
  const body = (await request.json().catch(() => null)) as {
    emoji?: string;
    action?: string;
  } | null;
  if (!body?.emoji || (body.action !== "add" && body.action !== "remove")) {
    return response({ error: "Invalid reaction" }, 400);
  }
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  return response(
    await changeReaction(
      env,
      params.slug ?? "",
      body.emoji,
      body.action,
      ip,
    ),
  );
};
