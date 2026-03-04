import { allBlogs } from "content-collections";
import { filterDrafts } from "@/lib/content";
import { error } from "@sveltejs/kit";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
  return filterDrafts(allBlogs).map((post) => ({ slug: post.id }));
};

export function load({ params }) {
  const post = allBlogs.find((p) => p.id === params.slug);

  if (!post) {
    error(404, "Post not found");
  }

  return {
    post,
    title: post.title,
    description: post.description,
    og: `/og/${post.id}.jpg`,
  };
}
