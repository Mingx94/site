import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-cloudflare";
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
  compilerOptions: {
    experimental: {
      async: true,
    },
  },
  kit: {
    adapter: adapter({
      // Keep build/prerender emulation local. The deployed Worker still uses
      // wrangler.jsonc; this only prevents local builds from requiring a
      // Cloudflare login for remote dev bindings.
      platformProxy: { remoteBindings: false },
    }),
    alias: {
      "@": "./src",
    },
    experimental: {
      remoteFunctions: true,
    },
  },
};
