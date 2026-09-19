import posts from "virtual:site-published-posts";
import type { Post } from "./posts";
export { getTags } from "./posts";

export async function getPosts(): Promise<Post[]> {
  return posts;
}

export async function getPost(slug: string): Promise<Post | null> {
  return posts.find((post) => post.id === slug) ?? null;
}
