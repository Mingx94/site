import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import * as v from "valibot";

const Contact = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(100)),
  email: v.pipe(v.string(), v.trim(), v.email(), v.maxLength(200)),
  message: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(2000)),
  turnstileToken: v.pipe(v.string(), v.trim(), v.nonEmpty()),
});

async function verifyTurnstile(token: string, secret: string, ip: string) {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  const data = (await response.json().catch(() => null)) as {
    success?: boolean;
  } | null;
  return response.ok && data?.success === true;
}

export const POST: APIRoute = async ({ request }) => {
  if (!env.BLOG_KV || !env.TURNSTILE_SECRET_KEY) {
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }

  const form = await request.formData();
  const parsed = v.safeParse(Contact, Object.fromEntries(form));
  if (!parsed.success) {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (!(await verifyTurnstile(parsed.output.turnstileToken, env.TURNSTILE_SECRET_KEY, ip))) {
    return Response.json({ error: "Turnstile verification failed" }, { status: 403 });
  }

  const { name, email, message } = parsed.output;
  await env.BLOG_KV.put(
    `contact:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`,
    JSON.stringify({ name, email, message, createdAt: new Date().toISOString() }),
    { expirationTtl: 60 * 60 * 24 * 90 },
  );

  await env.SEND_EMAIL?.send({
    from: "michael.tsai@vartifact.cc",
    to: "mingxcv@gmail.com",
    replyTo: email,
    subject: `網站聯絡表單 — ${name} 的訊息`,
    text: [
      `寄件者：${name}`,
      `電子郵件：${email}`,
      `時間：${new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`,
      "",
      "--- 訊息內容 ---",
      "",
      message,
    ].join("\n"),
  });

  return Response.json(
    { success: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
};
