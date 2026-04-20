import { query, command } from "$app/server";
import * as v from "valibot";
import { getKV, getRateLimit, getClientIp } from "$lib/server/platform";

const ALLOWED_EMOJIS = [
  "thumbsup",
  "heart",
  "fire",
  "bulb",
  "party",
] as const;

// How long to remember that a given IP already bumped a counter, so a
// reload / nav cycle doesn't re-increment. 24h means a returning visitor
// gets a fresh count the next day, which is a reasonable definition of
// "unique view" for a small blog.
const DEDUP_TTL_SECONDS = 24 * 60 * 60;

// Best-effort rate limit. Returns true when the request is allowed, false
// when it's been throttled. `null` binding (local dev) passes through.
async function rateLimitOk(key: string): Promise<boolean> {
  const rl = getRateLimit();
  if (!rl) return true;
  try {
    const { success } = await rl.limit({ key });
    return success;
  } catch {
    // Fail open rather than block users on a binding glitch.
    return true;
  }
}

// Per-IP dedup. Reads a short-TTL key; returns true if the caller has
// already acted in the window. Side-effect: when it returns false, it
// also writes the marker so the next call in the window is deduped.
async function dedupHit(
  kv: KVNamespace,
  dedupKey: string,
): Promise<boolean> {
  const seen = await kv.get(dedupKey);
  if (seen) return true;
  await kv.put(dedupKey, "1", { expirationTtl: DEDUP_TTL_SECONDS });
  return false;
}

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

  const ip = getClientIp();

  // Rate-limit per IP. 30 writes/min is well above any legitimate use.
  if (!(await rateLimitOk(`view:${ip}`))) {
    return parseInt((await kv.get(`views:${slug}`)) ?? "0", 10);
  }

  // Per-IP-per-slug dedup: re-reading the same article doesn't inflate.
  if (await dedupHit(kv, `dedup:view:${ip}:${slug}`)) {
    return parseInt((await kv.get(`views:${slug}`)) ?? "0", 10);
  }

  const key = `views:${slug}`;
  const current = parseInt((await kv.get(key)) ?? "0", 10);
  const next = current + 1;
  await kv.put(key, next.toString());
  // Refresh the query rather than optimistically .set()ting — the local
  // increment used to mask cases where KV's eventual-consistency made the
  // counter temporarily appear higher than reality.
  void getViews(slug).refresh();
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

    const ip = getClientIp();
    if (!(await rateLimitOk(`react:${ip}`))) return;

    // Idempotent per-IP: a user can only add one reaction of a given
    // emoji on a given slug per dedup window.
    if (await dedupHit(kv, `dedup:react:${ip}:${slug}:${emoji}`)) return;

    const key = `reactions:${slug}:${emoji}`;
    const current = parseInt((await kv.get(key)) ?? "0", 10);
    await kv.put(key, (current + 1).toString());

    void getReactions(slug).refresh();
  },
);

export const removeReaction = command(
  v.object({ slug: v.string(), emoji: v.string() }),
  async ({ slug, emoji }) => {
    if (!ALLOWED_EMOJIS.includes(emoji as (typeof ALLOWED_EMOJIS)[number])) {
      return;
    }

    const kv = getKV();
    if (!kv) return;

    const ip = getClientIp();
    if (!(await rateLimitOk(`react:${ip}`))) return;

    // Can only remove a reaction you actually added (i.e. the dedup
    // marker exists). Without this anyone could decrement anyone else's
    // reaction count.
    const dedupKey = `dedup:react:${ip}:${slug}:${emoji}`;
    const added = await kv.get(dedupKey);
    if (!added) return;

    const key = `reactions:${slug}:${emoji}`;
    const current = parseInt((await kv.get(key)) ?? "0", 10);
    await kv.put(key, Math.max(0, current - 1).toString());
    // Clear the dedup marker so the user can re-react next time.
    await kv.delete(dedupKey);

    void getReactions(slug).refresh();
  },
);
