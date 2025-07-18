import { filterDrafts } from "@/lib/content";
import { generateOgImageForPost } from "@/lib/generateOgImages";
import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

export async function getStaticPaths() {
  const posts = filterDrafts(await getCollection("blog"));

  return posts.map((post) => ({
    params: { route: `${post.id}.jpg` },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  await generateOgImageForPost({
    title: props.data.title,
    description: props.data.description,
  });
