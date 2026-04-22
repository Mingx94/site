import { allPosts, filterDrafts, type Post } from "@/lib/posts";
import { error } from "@sveltejs/kit";
import type { Component } from "svelte";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
  return filterDrafts(allPosts).map((post) => ({
    slug: post.id,
  }));
};

// Lazy-glob so Vite can statically enumerate every post module at build
// time without warning about dynamic imports, while still code-splitting
// each article into its own chunk.
const articleModules = import.meta.glob<{
  default: Component;
  metadata: Post;
}>("/src/content/posts/*/article.svx");

export async function load({ params }) {
  const loader = articleModules[`/src/content/posts/${params.slug}/article.svx`];
  if (!loader) error(404, `Could not find ${params.slug}`);

  const post = await loader();
  const postData = allPosts.find((p) => p.id === params.slug);

  return {
    content: post.default,
    metadata: post.metadata,
    id: params.slug,
    readingTime: postData?.readingTime,
  };
}
