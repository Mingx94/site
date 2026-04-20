import { allPosts, filterDrafts } from "@/lib/posts";
import config from "@/config";
import { escapeXml } from "@/lib/utils";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const posts = filterDrafts(allPosts);
  const baseUrl = config.site.base_url;

  // lastBuildDate = most recent post update/date, falls back to now if no posts.
  const latest = posts
    .map((p) => new Date(p.updated ?? p.date).getTime())
    .reduce((a, b) => Math.max(a, b), 0);
  const lastBuildDate = new Date(latest || Date.now()).toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.site.title)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(config.metadata.meta_description)}</description>
    <language>zh-tw</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
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
      .join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Prerendered — see sitemap.xml for rationale. Short browser cache so
      // feed readers pick up new posts promptly; longer edge cache.
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
};
