import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  loader: glob({
    pattern: "**/*/article.{md,mdx}",
    base: "./src/content/posts",
    generateId: (options) => options.entry.replace(/\/article\.(md|mdx)$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      id: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
      date: z.date(),
      image: image().optional(),
      draft: z.boolean().optional(),
    }),
});

const pageCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    id: z.string().optional(),
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    og: z.string().optional(),
    layout: z.string().optional(),
    draft: z.boolean().optional(),
    noindex: z.boolean().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  page: pageCollection,
};
