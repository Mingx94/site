import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex, escapeSvelte } from "mdsvex";
import remarkToc from "remark-toc";
import { createHighlighter } from "shiki";

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: [".svelte", ".md", ".svx"],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: [".md", ".svx"],
      remarkPlugins: [[remarkToc, { tight: true }]],
      highlight: {
        highlighter: async (code, lang = "text") => {
          const highlighter = await createHighlighter({
            themes: ["catppuccin-mocha"],
            langs: ["javascript", "typescript", "svelte"],
          });
          const html = escapeSvelte(
            highlighter.codeToHtml(code, { lang, theme }),
          );
          return `{@html \`${html}\` }`;
        },
      },
    }),
  ],
  kit: {
    adapter: adapter(),
    alias: {
      "@": "./src",
    },
  },
};
