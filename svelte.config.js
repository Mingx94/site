import adapter from "@sveltejs/adapter-cloudflare-workers";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      "@": "./src",
      "content-collections": "./.content-collections/generated",
    },
  },
};
