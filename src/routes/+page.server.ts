import { allBlogs } from "content-collections";
import { filterDrafts, sortByDate } from "@/lib/content";
import config from "@/config";

export function load() {
  const blogs = filterDrafts(allBlogs);
  const recentBlogs = sortByDate(blogs).slice(
    0,
    config.settings.num_posts_on_homepage,
  );

  return {
    recentBlogs,
    showMoreLink: blogs.length > recentBlogs.length,
  };
}
