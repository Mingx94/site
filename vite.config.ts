import adapter from "@sveltejs/adapter-cloudflare";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { escapeSvelte, mdsvex } from "mdsvex";
import remarkToc from "remark-toc";
import { createHighlighter } from "shiki";
import Icons from "unplugin-icons/vite";

const highlighterPromise = createHighlighter({
  themes: ["catppuccin-mocha"],
  langs: ["javascript", "typescript", "svelte"],
});

export default {
  plugins: [
    enhancedImages(), // must come before the SvelteKit plugin
    sveltekit({
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
                highlighter.codeToHtml(code, {
                  lang: lang ?? "text",
                  theme: "catppuccin-mocha",
                }),
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
    }),
    // The React plugin used to live here for the @vercel/og runtime route.
    // OG images are now generated at build time by scripts/gen-og.ts, so
    // React is a build-time-only dep and doesn't need a Vite plugin.
    Icons({ compiler: "svelte" }),
  ],
};
