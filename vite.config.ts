import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import react from "@vitejs/plugin-react";
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
    react(),
    Icons({ compiler: "svelte" }),
    fileSystemPath(),
  ],
};
