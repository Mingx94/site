import { getRequestEvent } from "$app/server";

export function getKV() {
  const event = getRequestEvent();
  return event.platform?.env?.BLOG_KV;
}

export function getTurnstileSecret() {
  const event = getRequestEvent();
  return event.platform?.env?.TURNSTILE_SECRET_KEY ?? "";
}

export function getSendEmail() {
  const event = getRequestEvent();
  return event.platform?.env?.SEND_EMAIL;
}
