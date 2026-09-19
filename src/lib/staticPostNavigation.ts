import { getPosts } from "./staticPosts";

export async function getPostLinks() {
  return (await getPosts()).map(({ id, title }) => ({ id, title }));
}
