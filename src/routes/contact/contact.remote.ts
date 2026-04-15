import { form } from "$app/server";
import { error } from "@sveltejs/kit";
import * as v from "valibot";
import { getKV, getSendEmail, getTurnstileSecret } from "$lib/server/platform";

async function verifyTurnstile(
  token: string,
  secret: string,
): Promise<boolean> {
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    },
  );
  const data: { success?: boolean } = await res.json();
  return data.success === true;
}

export const submitContact = form(
  v.object({
    name: v.pipe(v.string(), v.nonEmpty(), v.maxLength(100)),
    email: v.pipe(v.string(), v.email(), v.maxLength(200)),
    message: v.pipe(v.string(), v.nonEmpty(), v.maxLength(2000)),
    "cf-turnstile-response": v.pipe(v.string(), v.nonEmpty()),
  }),
  async (data) => {
    const kv = getKV();
    const secret = getTurnstileSecret();

    if (!kv || !secret) {
      error(503, "Service unavailable");
    }

    const valid = await verifyTurnstile(
      data["cf-turnstile-response"],
      secret,
    );
    if (!valid) {
      error(403, "Turnstile verification failed");
    }

    const id = `contact:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
    await kv.put(
      id,
      JSON.stringify({
        name: data.name,
        email: data.email,
        message: data.message,
        createdAt: new Date().toISOString(),
      }),
      { expirationTtl: 60 * 60 * 24 * 90 },
    );

    const sendEmail = getSendEmail();
    if (sendEmail) {
      await sendEmail.send({
        from: "michael.tsai@vartifact.cc",
        to: "mingxcv@gmail.com",
        subject: `[Blog] New contact from ${data.name}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
      });
    }

    return { success: true };
  },
);
