export const ALLOWED_EMOJIS = [
  "thumbsup",
  "heart",
  "fire",
  "bulb",
  "party",
] as const;

const DEDUP_TTL_SECONDS = 24 * 60 * 60;

async function rateLimitOk(rateLimit: RateLimit | undefined, key: string) {
  if (!rateLimit) return true;
  try {
    return (await rateLimit.limit({ key })).success;
  } catch {
    return true;
  }
}

async function dedupHit(kv: KVNamespace, key: string) {
  if (await kv.get(key)) return true;
  await kv.put(key, "1", { expirationTtl: DEDUP_TTL_SECONDS });
  return false;
}

export async function getViews(kv: KVNamespace | undefined, slug: string) {
  return kv ? Number.parseInt((await kv.get(`views:${slug}`)) ?? "0", 10) : 0;
}

export async function trackView(env: Env, slug: string, ip: string) {
  const kv = env.BLOG_KV;
  if (!kv) return 0;
  if (!(await rateLimitOk(env.BLOG_RATE, `view:${ip}`))) return getViews(kv, slug);
  if (await dedupHit(kv, `dedup:view:${ip}:${slug}`)) return getViews(kv, slug);
  const next = (await getViews(kv, slug)) + 1;
  await kv.put(`views:${slug}`, String(next));
  return next;
}

export async function getReactions(kv: KVNamespace | undefined, slug: string) {
  const result = Object.fromEntries(ALLOWED_EMOJIS.map((emoji) => [emoji, 0]));
  if (!kv) return result;
  await Promise.all(
    ALLOWED_EMOJIS.map(async (emoji) => {
      result[emoji] = Number.parseInt(
        (await kv.get(`reactions:${slug}:${emoji}`)) ?? "0",
        10,
      );
    }),
  );
  return result;
}

export async function changeReaction(
  env: Env,
  slug: string,
  emoji: string,
  action: "add" | "remove",
  ip: string,
) {
  if (!ALLOWED_EMOJIS.includes(emoji as (typeof ALLOWED_EMOJIS)[number])) {
    return getReactions(env.BLOG_KV, slug);
  }
  const kv = env.BLOG_KV;
  if (!kv || !(await rateLimitOk(env.BLOG_RATE, `react:${ip}`))) {
    return getReactions(kv, slug);
  }

  const dedupKey = `dedup:react:${ip}:${slug}:${emoji}`;
  const key = `reactions:${slug}:${emoji}`;
  const current = Number.parseInt((await kv.get(key)) ?? "0", 10);
  if (action === "add") {
    if (!(await dedupHit(kv, dedupKey))) await kv.put(key, String(current + 1));
  } else if (await kv.get(dedupKey)) {
    await kv.put(key, String(Math.max(0, current - 1)));
    await kv.delete(dedupKey);
  }
  return getReactions(kv, slug);
}
