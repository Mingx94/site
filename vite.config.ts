import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import Icons from "unplugin-icons/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { resolve } from "node:path";
import { editorContentApi } from "./vite-plugin-content-api";

export default {
  plugins: [
    tailwindcss(),
    enhancedImages(), // must come before the SvelteKit plugin
    sveltekit(),
    // The React plugin used to live here for the @vercel/og runtime route.
    // OG images are now generated at build time by scripts/gen-og.ts, so
    // React is a build-time-only dep and doesn't need a Vite plugin.
    Icons({ compiler: "svelte" }),
    // Dev-only filesystem API backing the `/__editor` UI. `apply: 'serve'`
    // ensures the plugin attaches only under `vite dev`; `vite build` and
    // `vite preview` skip it so no `node:fs` code reaches the Cloudflare
    // Worker bundle. See `vite-plugin-content-api.ts` for the endpoint set.
    {
      ...editorContentApi({
        root: resolve(import.meta.dirname, "src/content"),
      }),
      apply: "serve",
    },
  ],
};
