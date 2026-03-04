import { allBlogs } from "content-collections";
import { filterDrafts, sortByDate } from "@/lib/content";

export function load() {
  const data = sortByDate(filterDrafts(allBlogs));

  type Acc = { [year: string]: typeof data };
  const posts = data.reduce((acc: Acc, post) => {
    const year = post.date.getFullYear().toString();
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
