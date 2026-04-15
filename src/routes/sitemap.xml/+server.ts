import { allPosts, filterDrafts } from "@/lib/posts";
import config from "@/config";
import { escapeXml } from "@/lib/utils";
import { format } from "date-fns";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  const blog = filterDrafts(allPosts);
  const baseUrl = config.site.base_url;

  const urls = blog
    .map(
      (post) => `
    <url>
      <loc>${baseUrl}/blog/${escapeXml(post.id)}/</loc>
      <lastmod>${format(post.date, "yyyy-MM-dd")}</lastmod>
    </url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "max-age=3600",
    },
  });
};
