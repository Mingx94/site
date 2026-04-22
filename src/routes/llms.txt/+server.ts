import { allPosts, filterDrafts, sortByDate } from "@/lib/posts";
import config from "@/config";
import type { RequestHandler } from "./$types";

export const prerender = true;

/**
 * llms.txt — LLM-facing index of site content, per the emerging
 * convention at https://llmstxt.org. Lists each post's markdown URL so
 * crawlers can fetch the clean source instead of scraping HTML.
 */
export const GET: RequestHandler = () => {
  const posts = sortByDate(filterDrafts(allPosts));
  const baseUrl = config.site.base_url;

  const lines = [
    `# ${config.site.title}`,
    "",
    `> ${config.metadata.meta_description}`,
    "",
    "## Blog posts",
    "",
    ...posts.map((p) => {
      const url = `${baseUrl}/blog/${encodeURIComponent(p.id)}.md`;
      const desc = p.description ? `: ${p.description}` : "";
      return `- [${p.title}](${url})${desc}`;
    }),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
};
