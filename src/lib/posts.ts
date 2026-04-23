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

// Self-accepting HMR boundary. Without this, adding a file that matches the
// globs above (e.g. creating a post from the editor) invalidates this module
// and Vite's default fallback is a broadcast `full-reload` — which blows away
// the editor's in-memory tab state. Accepting here stops the propagation at
// this module: Vite re-evaluates it in place, ES module live bindings hand
// the fresh `allPosts` to importers on next access, and the editor (which
// doesn't import this file) never sees the reload.
if (import.meta.hot) import.meta.hot.accept();
