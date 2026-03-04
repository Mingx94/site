import { allBlogs } from "content-collections";
import { generateOgImageForPost } from "@/lib/generateOgImages";
import { error } from "@sveltejs/kit";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = () => {
  return allBlogs.map((post) => ({ slug: encodeURIComponent(post.id) }));
};

export const GET: RequestHandler = async ({ params }) => {
  const slug = decodeURIComponent(params.slug);
  const post = allBlogs.find((p) => p.id === slug);

  if (!post) {
    error(404, "Not found");
  }

  const image = await generateOgImageForPost({
    title: post.title,
    description: post.description,
  });

  return image;
};
