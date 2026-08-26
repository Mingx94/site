import { getPosts } from "@/lib/posts";
import { escapeXml } from "@/lib/utils";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const baseUrl = "https://vartifact.cc";
  const fixed = ["", "/blog", "/about", "/contact"];
  const posts = await getPosts();
  const urls = [
    ...fixed.map((path) => `  <url><loc>${baseUrl}${path}/</loc></url>`),
    ...posts.map(
      (post) =>
        `  <url><loc>${baseUrl}/blog/${escapeXml(post.id)}/</loc><lastmod>${(post.updated ?? post.date).slice(0, 10)}</lastmod></url>`,
    ),
  ].join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=3600",
      },
    },
  );
};
