import { allPosts } from "@/lib/posts";
import { generateOgImageForPost } from "@/lib/generateOgImages";
import { error } from "@sveltejs/kit";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = () => {
  return allPosts.map((post) => ({ slug: encodeURIComponent(post.id) }));
};

export const GET: RequestHandler = async ({ params }) => {
  const slug = decodeURIComponent(params.slug);
  const post = allPosts.find((p) => p.id === slug);

  if (!post) {
    error(404, "Not found");
  }

  const image = await generateOgImageForPost({
    title: post.title,
    description: post.description,
  });

  return image;
};
