import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import Icons from "unplugin-icons/vite";
import type { Plugin } from "vite";
import { enhancedImages } from "@sveltejs/enhanced-img";

function fileSystemPath(): Plugin {
  return {
    name: "vite-plugin-file-system-path",
    transform(_, id) {
      const identifier = "?filepath";
      if (id.endsWith(identifier)) {
        return {
          code: `export default ${JSON.stringify(id.slice(0, -identifier.length))}`,
          map: null,
        };
      }
    },
  };
}

export default {
  plugins: [
    tailwindcss(),
    enhancedImages(), // must come before the SvelteKit plugin
    sveltekit(),
    // The React plugin used to live here for the @vercel/og runtime route.
    // OG images are now generated at build time by scripts/gen-og.ts, so
    // React is a build-time-only dep and doesn't need a Vite plugin.
    Icons({ compiler: "svelte" }),
    fileSystemPath(),
  ],
};
