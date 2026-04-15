import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const GET: RequestHandler = async ({ params, platform }) => {
  const kv = platform?.env?.BLOG_KV;
  if (!kv) return json({ views: 0 });

  const views = await kv.get(`views:${params.slug}`);
  return json({ views: parseInt(views ?? "0", 10) });
};

export const POST: RequestHandler = async ({ params, platform }) => {
  const kv = platform?.env?.BLOG_KV;
  if (!kv) return json({ views: 0 });

  const key = `views:${params.slug}`;
  const current = parseInt((await kv.get(key)) ?? "0", 10);
  const next = current + 1;
  await kv.put(key, next.toString());

  return json({ views: next });
};
