import config from "@/config";
import { filterDrafts } from "@/lib/content";
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
const parser = new MarkdownIt();

export const GET: APIRoute = async (context) => {
  const blog = filterDrafts(await getCollection("blog"));

  return rss({
    // `<title>` field in output xml
    title: config.site.title,
    // `<description>` field in output xml
    description: config.metadata.meta_description,
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#site
    site: context.site ?? config.site.base_url,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      content: sanitizeHtml(parser.render(post.body!), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      }),
    })),
    // (optional) inject custom xml
    // customData: `<language>en-us</language>`,
  });
};
