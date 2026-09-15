import type { APIRoute } from "astro";

export const GET: APIRoute = ({ url }) => {
  const isPreview = url.hostname.endsWith(".workers.dev");
  const body = isPreview
    ? `User-agent: *
Disallow: /`
    : `User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=no, ai-train=no

Sitemap: https://vartifact.cc/sitemap.xml`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
