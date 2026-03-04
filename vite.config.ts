import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import react from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import type { Plugin } from "vite";

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
    sveltekit(),
    contentCollections(),
    react(),
    Icons({ compiler: "svelte" }),
    fileSystemPath(),
  ],
};
