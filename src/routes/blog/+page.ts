import { allPosts, filterDrafts, sortByDate } from "@/lib/posts";

export const prerender = true;

export function load() {
  const data = sortByDate(filterDrafts(allPosts));

  type Acc = { [year: string]: typeof data };
  const posts = data.reduce((acc: Acc, post) => {
    const year = new Date(post.date).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {});

  const years = Object.keys(posts).toSorted(
    (a, b) => parseInt(b) - parseInt(a),
  );

  return { posts, years };
}
