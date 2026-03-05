import { allPosts, filterDrafts, sortByDate } from "@/lib/posts";
import config from "@/config";

export function load() {
  const blogs = filterDrafts(allPosts);
  const recentBlogs = sortByDate(blogs).slice(
    0,
    config.settings.num_posts_on_homepage,
  );

  return {
    recentBlogs,
    showMoreLink: blogs.length > recentBlogs.length,
  };
}
