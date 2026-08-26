import config from "@/config";
import { getPosts } from "@/lib/posts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const lines = [
    `# ${config.site.title}`,
    "",
    `> ${config.metadata.meta_description}`,
    "",
    "## Blog posts",
    "",
    ...posts.map((post) => `- [${post.title}](https://vartifact.cc/blog/${encodeURIComponent(post.id)}.md)${post.description ? `: ${post.description}` : ""}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=3600" } });
};
