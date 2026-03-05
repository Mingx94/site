import { allPosts, filterDrafts } from "@/lib/posts";
import config from "@/config";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  const posts = filterDrafts(allPosts);
  const baseUrl = config.site.base_url;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.site.title}</title>
    <link>${baseUrl}</link>
    <description>${config.metadata.meta_description}</description>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map(
        (post) => `
						<item>
							<title>${post.title}</title>
							<description>${post.description}</description>
							<link>${baseUrl}/blog/${post.id}</link>
							<guid isPermaLink="true">${baseUrl}/blog/${post.id}</guid>
							<pubDate>${new Date(post.date).toUTCString()}</pubDate>
						</item>
					`,
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "max-age=3600",
    },
  });
};
