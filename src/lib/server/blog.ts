const DEDUP_TTL_SECONDS = 24 * 60 * 60;
const VIEW_METRIC = "views";

export const COUNTER_CHANGE_SQL = `INSERT INTO site_counters (slug, metric, value)
     VALUES (?, ?, MAX(0, ? + ?))
     ON CONFLICT (slug, metric) DO UPDATE
     SET value = MAX(0, site_counters.value + ?)
     RETURNING value`;

type CounterRow = { value: number };

function count(value: string | number | null | undefined) {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(value ?? "0", 10);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export async function getViews(env: Env, slug: string) {
  const row = await env.DB.prepare(
    "SELECT value FROM site_counters WHERE slug = ? AND metric = ?",
  )
    .bind(slug, VIEW_METRIC)
    .first<CounterRow>();
  // KV remains the read fallback until this counter receives its first D1 write.
  return row ? count(row.value) : count(await env.BLOG_KV.get(`views:${slug}`));
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

export async function trackView(env: Env, slug: string, ip: string) {
  const kv = env.BLOG_KV;
  if (!(await rateLimitOk(env.BLOG_RATE, `view:${ip}`)))
    return getViews(env, slug);
  if (await dedupHit(kv, `dedup:view:${ip}:${slug}`))
    return getViews(env, slug);
  const legacyValue = count(await kv.get(`views:${slug}`));
  const row = await env.DB.prepare(COUNTER_CHANGE_SQL)
    .bind(slug, VIEW_METRIC, legacyValue, 1, 1)
    .first<CounterRow>();
  return count(row?.value);
}
