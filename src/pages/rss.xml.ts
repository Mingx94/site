import config from "@/config";
import { getPosts } from "@/lib/posts";
import { escapeXml } from "@/lib/utils";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const baseUrl = "https://vartifact.cc";
  const latest = Math.max(
    0,
    ...posts.map((post) => Date.parse(post.updated ?? post.date)),
  );
  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.description ?? "")}</description>
      <link>${baseUrl}/blog/${encodeURIComponent(post.id)}/</link>
      <guid isPermaLink="true">${baseUrl}/blog/${encodeURIComponent(post.id)}/</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.site.title)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(config.metadata.meta_description)}</description>
    <language>zh-tw</language>
    <lastBuildDate>${new Date(latest || Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`,
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=3600",
      },
    },
  );
};
