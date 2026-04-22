import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";

// Security headers applied to every response. Values chosen to match the
// site's actual external dependencies (Google Fonts, Cloudflare Insights,
// Cloudflare Turnstile on the contact form) without breaking Svelte's
// inline hydration scripts.
//
// Notes:
//   - `'unsafe-inline'` in script-src is necessary for SvelteKit's hydration
//     payloads; tightening this requires nonce-based CSP which SvelteKit
//     supports via `csp.mode: 'nonce'` in svelte.config — a larger change.
//   - `'unsafe-inline'` in style-src is necessary for Shiki's inline styled
//     code blocks and Tailwind's per-component inline styles.
//   - `challenges.cloudflare.com` is whitelisted in `script-src` / `frame-src`
//     / `connect-src` because the contact form loads the Turnstile widget
//     from there. Without `frame-src`, `default-src 'self'` would block the
//     widget's iframe.
//   - HSTS is intentionally long-lived (1 year) with `includeSubDomains`.
//     Cloudflare Workers always serve over HTTPS; if you ever need to serve
//     http for staging, drop the header in that environment.
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

export const handle: Handle = async ({ event, resolve }) => {
  // The (editor) route group at `/editor/*` and the `/__editor/*`
  // content-API middleware are local-only dev tools. `+layout.server.ts`
  // already throws 404 for the route group in production, and
  // `editorContentApi` refuses to attach outside `vite dev` — this early
  // return is a belt-and-suspenders check that covers direct requests to
  // either surface (`/editor`, `/__editor/file?…`, …) which could
  // otherwise fall through SvelteKit's routing.
  if (
    !dev &&
    (event.url.pathname === "/editor" ||
      event.url.pathname.startsWith("/editor/") ||
      event.url.pathname.startsWith("/__editor"))
  ) {
    return new Response(null, { status: 404 });
  }

  const response = await resolve(event);

  // Skip every site-wide security header for the dev-only editor surfaces.
  // The editor chrome (/editor) mounts a sandboxed iframe at /editor/preview;
  // X-Frame-Options: DENY and CSP `frame-ancestors 'none'` would otherwise
  // block the iframe. Both routes only ever serve in dev (see guard above
  // + `+layout.server.ts`), so there's nothing worth hardening here — the
  // iframe sandbox attribute is the real boundary.
  //
  // Also send `Cache-Control: no-store` on editor routes: otherwise the
  // browser may pin the FIRST response's security-header set to the URL
  // and keep enforcing it on future iframe loads even after the server
  // starts returning clean headers.
  const isEditor =
    event.url.pathname === "/editor" ||
    event.url.pathname.startsWith("/editor/");
  if (isEditor) {
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

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
