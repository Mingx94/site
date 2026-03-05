import { allPosts, filterDrafts, type Post } from "@/lib/posts";
import { error } from "@sveltejs/kit";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
  return filterDrafts(allPosts).map((post) => ({
    slug: post.id,
  }));
};

export async function load({ params }) {
  try {
    const post = await import(`@/content/posts/${params.slug}/article.svx`);

    return {
      content: post.default,
      metadata: post.metadata as Post,
      id: params.slug,
    };
  } catch (e) {
    error(404, `Could not find ${params.slug}`);
  }
}
