import { fail } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ platform }) => {
  return {
    turnstileSiteKey: platform?.env?.TURNSTILE_SITE_KEY ?? "",
  };
};

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(1).max(2000),
  "cf-turnstile-response": z.string().min(1),
});

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
  const data = await res.json();
  return data.success === true;
}

export const actions = {
  default: async ({ request, platform }) => {
    const kv = platform?.env?.BLOG_KV;
    const secret = platform?.env?.TURNSTILE_SECRET_KEY;

    if (!kv || !secret) {
      return fail(503, { error: "Service unavailable" });
    }

    const formData = Object.fromEntries(await request.formData());
    const parsed = contactSchema.safeParse(formData);

    if (!parsed.success) {
      return fail(400, { error: "Invalid form data" });
    }

    const { name, email, message } = parsed.data;
    const token = parsed.data["cf-turnstile-response"];

    const valid = await verifyTurnstile(token, secret);
    if (!valid) {
      return fail(403, { error: "Turnstile verification failed" });
    }

    const id = `contact:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
    await kv.put(
      id,
      JSON.stringify({
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
      }),
      { expirationTtl: 60 * 60 * 24 * 90 },
    );

    return { success: true };
  },
} satisfies Actions;
