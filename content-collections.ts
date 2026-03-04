import {
  createDefaultImport,
  defineCollection,
  defineConfig,
} from "@content-collections/core";
import remarkToc from "remark-toc";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeShiki from "@shikijs/rehype";
import { unified } from "unified";
import { z } from "zod";

async function markdownToHtml(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkToc, { tight: true })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeShiki, { theme: "catppuccin-mocha" })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  return String(result);
}

const blog = defineCollection({
  name: "blog",
  directory: "src/content/posts",
  include: "**/article.{md,mdx}",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().optional(),
    content: z.string(),
    image: z.string().optional(),
  }),
  transform: async (doc, { cache, ...tst }) => {
    const html = await cache(doc.content, async (content) => {
      return markdownToHtml(content);
    });

    const image = doc.image
      ? createDefaultImport<string>(
          `@/content/posts/${doc._meta.directory}/${doc.image}`,
        )
      : undefined;

    const id = doc._meta.directory;
    return { ...doc, html, id, image };
  },
});

export default defineConfig({ content: [blog] });
