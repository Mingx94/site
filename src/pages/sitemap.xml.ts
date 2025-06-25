import { filterDrafts } from "@/lib/content";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { format } from "date-fns";

export const GET: APIRoute = async ({ site }) => {
  const blog = filterDrafts(await getCollection("blog"));

  const xmlSitemap = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${blog
        .map(
          (post) => `
        <url>
          <loc>${site}/blog/${post.id}/</loc>
          <lastmod>${format(post.data.date, "yyyy-MM-dd")}</lastmod>
        </url>
      `,
        )
        .join("")}
    </urlset>
  `;

  return new Response(xmlSitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
