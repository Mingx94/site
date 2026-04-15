import { query, command } from "$app/server";
import * as v from "valibot";
import { getKV } from "$lib/server/platform";

const ALLOWED_EMOJIS = [
  "thumbsup",
  "heart",
  "fire",
  "bulb",
  "party",
] as const;

// --- Views ---

export const getViews = query(v.string(), async (slug) => {
  const kv = getKV();
  if (!kv) return 0;
  const views = await kv.get(`views:${slug}`);
  return parseInt(views ?? "0", 10);
});

export const trackView = command(v.string(), async (slug) => {
  const kv = getKV();
  if (!kv) return 0;
  const key = `views:${slug}`;
  const current = parseInt((await kv.get(key)) ?? "0", 10);
  const next = current + 1;
  await kv.put(key, next.toString());
  getViews(slug).set(next);
  return next;
});

// --- Reactions ---

export const getReactions = query(v.string(), async (slug) => {
  const kv = getKV();
  if (!kv) return Object.fromEntries(ALLOWED_EMOJIS.map((e) => [e, 0]));

  const results: Record<string, number> = {};
  for (const emoji of ALLOWED_EMOJIS) {
    const val = await kv.get(`reactions:${slug}:${emoji}`);
    results[emoji] = parseInt(val ?? "0", 10);
  }
  return results;
});

export const addReaction = command(
  v.object({ slug: v.string(), emoji: v.string() }),
  async ({ slug, emoji }) => {
    if (!ALLOWED_EMOJIS.includes(emoji as (typeof ALLOWED_EMOJIS)[number])) {
      return;
    }

    const kv = getKV();
    if (!kv) return;

    const key = `reactions:${slug}:${emoji}`;
    const current = parseInt((await kv.get(key)) ?? "0", 10);
    await kv.put(key, (current + 1).toString());

    void getReactions(slug).refresh();
  },
);
