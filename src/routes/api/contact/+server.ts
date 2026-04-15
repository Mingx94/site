import { json } from "@sveltejs/kit";
import { z } from "zod";
import type { RequestHandler } from "./$types";

export const prerender = false;

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(1).max(2000),
  token: z.string().min(1),
});

async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json();
  return data.success === true;
}

export const POST: RequestHandler = async ({ request, platform }) => {
  const kv = platform?.env?.BLOG_KV;
  const secret = platform?.env?.TURNSTILE_SECRET_KEY;

  if (!kv || !secret) {
    return json({ error: "Service unavailable" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  const { name, email, message, token } = parsed.data;

  const valid = await verifyTurnstile(token, secret);
  if (!valid) {
    return json({ error: "Turnstile verification failed" }, { status: 403 });
  }

  const id = `contact:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
  await kv.put(
    id,
    JSON.stringify({ name, email, message, createdAt: new Date().toISOString() }),
    { expirationTtl: 60 * 60 * 24 * 90 }, // 90 days
  );

  return json({ success: true });
};
