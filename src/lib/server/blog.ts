export const ALLOWED_EMOJIS = [
  "thumbsup",
  "heart",
  "fire",
  "bulb",
  "party",
] as const;

const DEDUP_TTL_SECONDS = 24 * 60 * 60;
const VIEW_METRIC = "views";

export const COUNTER_CHANGE_SQL = `INSERT INTO site_counters (slug, metric, value)
     VALUES (?, ?, MAX(0, ? + ?))
     ON CONFLICT (slug, metric) DO UPDATE
     SET value = MAX(0, site_counters.value + ?)
     RETURNING value`;

type CounterRow = { value: number };
type MetricCounterRow = CounterRow & { metric: string };

function reactionMetric(emoji: string) {
  return `reaction:${emoji}`;
}

function count(value: string | number | null | undefined) {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(value ?? "0", 10);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

async function legacyCounter(kv: KVNamespace, key: string) {
  return count(await kv.get(key));
}

async function getCounter(
  env: Env,
  slug: string,
  metric: string,
  legacyKey: string,
) {
  const row = await env.DB.prepare(
    "SELECT value FROM site_counters WHERE slug = ? AND metric = ?",
  )
    .bind(slug, metric)
    .first<CounterRow>();
  // KV remains the read fallback until this counter receives its first D1 write.
  return row ? count(row.value) : legacyCounter(env.BLOG_KV, legacyKey);
}

async function changeCounter(
  env: Env,
  slug: string,
  metric: string,
  legacyKey: string,
  delta: 1 | -1,
) {
  const legacyValue = await legacyCounter(env.BLOG_KV, legacyKey);
  const row = await env.DB.prepare(COUNTER_CHANGE_SQL)
    .bind(slug, metric, legacyValue, delta, delta)
    .first<CounterRow>();
  return count(row?.value);
}

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

export async function getViews(env: Env, slug: string) {
  return getCounter(env, slug, VIEW_METRIC, `views:${slug}`);
}

export async function trackView(env: Env, slug: string, ip: string) {
  const kv = env.BLOG_KV;
  if (!(await rateLimitOk(env.BLOG_RATE, `view:${ip}`)))
    return getViews(env, slug);
  if (await dedupHit(kv, `dedup:view:${ip}:${slug}`))
    return getViews(env, slug);
  return changeCounter(env, slug, VIEW_METRIC, `views:${slug}`, 1);
}

export async function getReactions(env: Env, slug: string) {
  const metrics = ALLOWED_EMOJIS.map(reactionMetric);
  const placeholders = metrics.map(() => "?").join(", ");
  const { results } = await env.DB.prepare(
    `SELECT metric, value FROM site_counters
     WHERE slug = ? AND metric IN (${placeholders})`,
  )
    .bind(slug, ...metrics)
    .all<MetricCounterRow>();
  const stored = new Map(results.map((row) => [row.metric, count(row.value)]));
  const entries = await Promise.all(
    ALLOWED_EMOJIS.map(async (emoji) => {
      const value = stored.get(reactionMetric(emoji));
      return [
        emoji,
        value ??
          (await legacyCounter(env.BLOG_KV, `reactions:${slug}:${emoji}`)),
      ] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export async function changeReaction(
  env: Env,
  slug: string,
  emoji: string,
  action: "add" | "remove",
  ip: string,
) {
  if (!ALLOWED_EMOJIS.includes(emoji as (typeof ALLOWED_EMOJIS)[number])) {
    return getReactions(env, slug);
  }
  const kv = env.BLOG_KV;
  if (!(await rateLimitOk(env.BLOG_RATE, `react:${ip}`))) {
    return getReactions(env, slug);
  }

  const dedupKey = `dedup:react:${ip}:${slug}:${emoji}`;
  const legacyKey = `reactions:${slug}:${emoji}`;
  if (action === "add") {
    if (!(await dedupHit(kv, dedupKey))) {
      await changeCounter(env, slug, reactionMetric(emoji), legacyKey, 1);
    }
  } else if (await kv.get(dedupKey)) {
    await changeCounter(env, slug, reactionMetric(emoji), legacyKey, -1);
    await kv.delete(dedupKey);
  }
  return getReactions(env, slug);
}
