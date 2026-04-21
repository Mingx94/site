import config from "@/config";
import type { RequestHandler } from "./$types";

export const prerender = true;

/**
 * RFC 9727 API catalog in `application/linkset+json`.
 *
 * This site is a content site rather than an API product, so the catalog
 * advertises the two discoverable machine-readable resources that actually
 * exist: the RSS feed (IANA link rel `feed`) and the XML sitemap
 * (`sitemap`). No `service-desc` / `service-doc` / `status` entries are
 * claimed — there is no OpenAPI document, developer docs endpoint, or
 * health probe to point at, and fabricating one would be worse than
 * leaving it out.
 */
export const GET: RequestHandler = () => {
  const baseUrl = config.site.base_url;

  const linkset = {
    linkset: [
      {
        anchor: `${baseUrl}/`,
        feed: [
          {
            href: `${baseUrl}/rss.xml`,
            type: "application/rss+xml",
            title: "Vartifact blog RSS feed",
          },
        ],
        sitemap: [
          {
            href: `${baseUrl}/sitemap.xml`,
            type: "application/xml",
          },
        ],
      },
    ],
  };

  return new Response(JSON.stringify(linkset, null, 2), {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
