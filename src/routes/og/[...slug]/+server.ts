import { allPosts, filterDrafts } from "@/lib/posts";
import { generateOgImageForPost } from "@/lib/generateOgImages";
import { error } from "@sveltejs/kit";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

// Only generate OG images for published posts. Using `allPosts` here would
// prerender `/og/<draft-slug>.jpg` and leak draft content via the image
// endpoint even though the article page itself 404s.
export const entries: EntryGenerator = () => {
  return filterDrafts(allPosts).map((post) => ({
    slug: encodeURIComponent(post.id),
  }));
};

export const GET: RequestHandler = async ({ params }) => {
  const slug = decodeURIComponent(params.slug);
  const post = filterDrafts(allPosts).find((p) => p.id === slug);

  if (!post) {
    error(404, "Not found");
  }

  const image = await generateOgImageForPost({
    title: post.title,
    description: post.description,
  });

  return image;
};
