import type { Handle } from "@sveltejs/kit";

// Security headers applied to every response. Values chosen to match the
// site's actual external dependencies (Google Fonts, Cloudflare Insights)
// without breaking Svelte's inline hydration scripts.
//
// Notes:
//   - `'unsafe-inline'` in script-src is necessary for SvelteKit's hydration
//     payloads; tightening this requires nonce-based CSP which SvelteKit
//     supports via `csp.mode: 'nonce'` in svelte.config — a larger change.
//   - `'unsafe-inline'` in style-src is necessary for Shiki's inline styled
//     code blocks and Tailwind's per-component inline styles.
//   - HSTS is intentionally long-lived (1 year) with `includeSubDomains`.
//     Cloudflare Workers always serve over HTTPS; if you ever need to serve
//     http for staging, drop the header in that environment.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://static.cloudflareinsights.com",
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

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    // Preserve existing headers if a route explicitly set them (e.g. RSS /
    // sitemap have their own Cache-Control); we're only filling in security
    // headers that weren't specified.
    if (!response.headers.has(name)) {
      response.headers.set(name, value);
    }
  }
  return response;
};
