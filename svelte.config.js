import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex, escapeSvelte } from "mdsvex";
import remarkToc from "remark-toc";
import { createHighlighter } from "shiki";

const highlighterPromise = createHighlighter({
  themes: ["catppuccin-mocha"],
  langs: ["javascript", "typescript", "svelte"],
});

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
          const highlighter = await highlighterPromise;
          const html = escapeSvelte(
            highlighter.codeToHtml(code, { lang, theme: "catppuccin-mocha" }),
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
