import config from "@/config";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  const baseUrl = config.site.base_url;
  // Content-Signal (contentsignals.org / draft-romm-aipref-contentsignals)
  // declares how this site's content may be used by automated clients:
  //   search    = yes → allow indexing for search surfaces
  //   ai-input  = no  → do not use as grounding for AI answers/summaries
  //   ai-train  = no  → do not use for model training
  const body = `User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=no, ai-train=no

Sitemap: ${baseUrl}/sitemap.xml`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
