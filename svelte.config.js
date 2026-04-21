import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex, escapeSvelte } from "mdsvex";
import remarkToc from "remark-toc";
import { createHighlighter } from "shiki";

// Dynamically load the Cloudflare adapter so this config can still be
// evaluated from workspaces that don't install `@sveltejs/adapter-cloudflare`
// — specifically the editor sub-app's `svelte-check`, which walks up to
// this file when processing .svelte files under `src/content/` that it
// imports via its `$content/*` alias. `svelte-check` only needs the
// preprocessors from this config, not the adapter, so a missing adapter
// is harmless in that path. `svelte-kit build` (where the adapter is
// actually used) always runs with the dep installed.
const adapter = await import("@sveltejs/adapter-cloudflare")
  .then((m) => m.default)
  .catch(() => null);

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
    // `adapter` is `null` only when the dep isn't installed in this
    // workspace (see top-of-file note). `vite build` will have it.
    adapter: adapter?.(),
    alias: {
      "@": "./src",
    },
    experimental: {
      remoteFunctions: true,
    },
  },
};
