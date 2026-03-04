import { allBlogs } from "content-collections";
import { filterDrafts } from "@/lib/content";
import config from "@/config";
import sanitizeHtml from "sanitize-html";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  const blog = filterDrafts(allBlogs);
  const baseUrl = config.site.base_url;

  const items = blog
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.id}/</link>
      <guid>${baseUrl}/blog/${post.id}/</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      ${post.description ? `<description><![CDATA[${post.description}]]></description>` : ""}
      <content:encoded><![CDATA[${sanitizeHtml(post.html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      })}]]></content:encoded>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.site.title}</title>
    <link>${baseUrl}</link>
    <description>${config.metadata.meta_description}</description>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "max-age=3600",
    },
  });
};
