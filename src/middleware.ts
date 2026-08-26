import { postToMarkdown } from "@/lib/markdown";
import { getPost } from "@/lib/posts";
import { defineMiddleware } from "astro:middleware";
import { prefersMarkdown } from "./lib/accept";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://static.cloudflareinsights.com https://challenges.cloudflare.com",
  "frame-src 'self' https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP,
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

const BLOG_POST_PATH = /^\/blog\/([^/]+?)\/?$/;

export const onRequest = defineMiddleware(async ({ request, url }, next) => {
  const slug = BLOG_POST_PATH.exec(url.pathname)?.[1];
  if (slug && prefersMarkdown(request.headers.get("accept"))) {
    const post = await getPost(slug);
    if (!post) return new Response("Not found", { status: 404 });
    return new Response(postToMarkdown(post), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=3600",
        Vary: "Accept",
      },
    });
  }

  const response = await next();
  if (slug) {
    response.headers.append("Vary", "Accept");
    response.headers.set(
      "Link",
      `</blog/${encodeURIComponent(slug)}.md>; rel="alternate"; type="text/markdown"`,
    );
  }
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(name)) response.headers.set(name, value);
  }
  return response;
});
