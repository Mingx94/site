import { postToMarkdown } from "@/lib/markdown";
import { getPost, getPosts } from "@/lib/posts";
import type { APIRoute } from "astro";

export async function getStaticPaths() {
  return (await getPosts()).map((post) => ({ params: { slug: post.id } }));
}

export const GET: APIRoute = async ({ params }) => {
  const post = await getPost(params.slug ?? "");
  if (!post) return new Response("Not found", { status: 404 });
  return new Response(postToMarkdown(post), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
};
