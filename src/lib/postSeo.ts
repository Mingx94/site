import { getSeoMeta } from "emdash/seo";
import config from "../config";
import type { Post } from "./posts";

interface PostSeoOptions {
  path: string;
  siteUrl: URL;
}

export function resolvePostSeo(post: Post, { path, siteUrl }: PostSeoOptions) {
  const defaultOgImage = new URL(post.cover ?? "/og.jpg", siteUrl).href;

  return getSeoMeta(
    {
      data: {
        title: post.title,
        excerpt: post.description,
        seo: post.seo,
      },
    },
    {
      siteTitle: config.site.name,
      siteUrl: siteUrl.origin,
      path,
      defaultOgImage,
    },
  );
}
