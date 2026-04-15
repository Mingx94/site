import { compareDesc } from "date-fns";
import { getReadingTime } from "./readingTime";

export interface Post {
  id: string;
  title: string;
  description?: string;
  content: string;
  date: Date;
  updated?: Date;
  draft?: boolean;
  readingTime?: number;
}

// Eagerly load all post metadata from frontmatter
const postModules = import.meta.glob("/src/content/posts/*/article.svx", {
  eager: true,
});

// Load raw content for reading time calculation
const rawModules = import.meta.glob("/src/content/posts/*/article.svx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const allPosts: Post[] = Object.entries(postModules)
  .map(([path, file]) => {
    const id = path.split("/").at(-2)!;

    if (file && typeof file === "object" && "metadata" in file && id) {
      const metadata = file.metadata as Omit<Post, "slug">;
      const raw = rawModules[path] ?? "";
      const readingTime = getReadingTime(raw);
      const post = { ...metadata, id, readingTime } satisfies Post;

      return post;
    }

    return null;
  })
  .filter((p) => p !== null);

// sort by date descending
export const sortByDate = (posts: Post[]): Post[] =>
  posts.toSorted((a, b) => compareDesc(a.date, b.date));

export const filterDrafts = (posts: Post[]): Post[] => {
  if (import.meta.env.DEV) return posts;
  return posts.filter((p) => !p.draft);
};
