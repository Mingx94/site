import { allPosts, filterDrafts } from "@/lib/posts";
import { error } from "@sveltejs/kit";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

// Raw .svx source for every post, keyed by slug. Vite inlines these as
// strings at build time so we can serve them without any Svelte
// compilation step.
const rawModules = import.meta.glob("/src/content/posts/*/article.svx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const rawBySlug = Object.fromEntries(
  Object.entries(rawModules).map(([path, raw]) => [
    // /src/content/posts/<slug>/article.svx → <slug>
    path.split("/").at(-2)!,
    raw,
  ]),
);

export const entries: EntryGenerator = () =>
  filterDrafts(allPosts).map((post) => ({ slug: post.id }));

/**
 * Markdown representation of the post at `/blog/<slug>/`.
 *
 * Linked from the HTML page via a `Link: rel="alternate"` header so agents
 * that prefer `text/markdown` can discover it. The response body is the
 * raw `.svx` source with the YAML frontmatter fence stripped — any inline
 * Svelte components survive as-is, which is acceptable because the agent
 * markdown spec permits embedded HTML/components.
 */
export const GET: RequestHandler = ({ params }) => {
  const raw = rawBySlug[params.slug];
  if (!raw) error(404, `Could not find ${params.slug}`);

  const post = allPosts.find((p) => p.id === params.slug);
  if (!post || (post.draft && !import.meta.env.DEV)) {
    error(404, `Could not find ${params.slug}`);
  }

  return new Response(stripFrontmatter(raw), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
};

// Remove a leading `---\n…\n---\n` YAML frontmatter block if present.
// Keeps any frontmatter that appears later in the document untouched.
function stripFrontmatter(source: string): string {
  if (!source.startsWith("---")) return source;
  const end = source.indexOf("\n---", 3);
  if (end === -1) return source;
  // Skip the closing fence and the newline that follows it.
  const afterFence = source.indexOf("\n", end + 1);
  return afterFence === -1 ? "" : source.slice(afterFence + 1);
}
