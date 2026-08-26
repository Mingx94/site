import type { APIRoute } from "astro";

export const GET: APIRoute = () => new Response(`User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=no, ai-train=no

Sitemap: https://vartifact.cc/sitemap.xml`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
