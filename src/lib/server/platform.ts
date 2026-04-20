import { getRequestEvent } from "$app/server";
import { dev } from "$app/environment";

// One-shot dev warning: Cloudflare bindings are unavailable under plain
// `vite dev`, so every call to getKV() returns undefined and every KV-backed
// command/query silently no-ops. Warning once surfaces that clearly instead
// of letting the view counter / reactions appear "broken" with no clue why.
let kvWarnedInDev = false;

export function getKV() {
  const event = getRequestEvent();
  const kv = event.platform?.env?.BLOG_KV;
  if (!kv && dev && !kvWarnedInDev) {
    kvWarnedInDev = true;
    console.warn(
      "[blog] BLOG_KV binding unavailable — view counter and reactions " +
        "will no-op in this session. Run `wrangler dev` to attach bindings.",
    );
  }
  return kv;
}

export function getTurnstileSecret() {
  const event = getRequestEvent();
  return event.platform?.env?.TURNSTILE_SECRET_KEY ?? "";
}

export function getSendEmail() {
  const event = getRequestEvent();
  return event.platform?.env?.SEND_EMAIL;
}
