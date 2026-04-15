import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const prerender = false;

const ALLOWED_EMOJIS = ["thumbsup", "heart", "fire", "bulb", "party"] as const;

export const GET: RequestHandler = async ({ params, platform }) => {
  const kv = platform?.env?.BLOG_KV;
  if (!kv) {
    return json(Object.fromEntries(ALLOWED_EMOJIS.map((e) => [e, 0])));
  }

  const results: Record<string, number> = {};
  for (const emoji of ALLOWED_EMOJIS) {
    const val = await kv.get(`reactions:${params.slug}:${emoji}`);
    results[emoji] = parseInt(val ?? "0", 10);
  }

  return json(results);
};

export const POST: RequestHandler = async ({ params, platform, request }) => {
  const kv = platform?.env?.BLOG_KV;
  if (!kv) return json({ error: "KV not available" }, { status: 503 });

  const body = await request.json();
  const emoji = body.emoji;

  if (!ALLOWED_EMOJIS.includes(emoji)) {
    return json({ error: "Invalid emoji" }, { status: 400 });
  }

  const key = `reactions:${params.slug}:${emoji}`;
  const current = parseInt((await kv.get(key)) ?? "0", 10);
  const next = current + 1;
  await kv.put(key, next.toString());

  return json({ [emoji]: next });
};
