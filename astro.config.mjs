// @ts-check
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import compressor from "astro-compressor";
import { defineConfig } from "astro/config";
import remarkToc from "remark-toc";
import Icons from "unplugin-icons/vite";
import config from "./src/config";
import react from "@vitejs/plugin-react";

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url,
  integrations: [
    AutoImport({
      imports: [
        "@/components/md/Button.svelte",
        "@/components/md/Accordion.svelte",
        "@/components/md/Notice.svelte",
        "@/components/md/Video.svelte",
        "@/components/md/Tabs.svelte",
        "@/components/md/Tab.svelte",
        {
          "astro-embed": ["YouTube"],
        },
      ],
    }),
    mdx({
      shikiConfig: {
        theme: "catppuccin-mocha",
        wrap: true,
      },
    }),
    compressor({ brotli: true, gzip: false }),
    svelte({ extensions: [".svelte"] }),
  ],

  markdown: {
    remarkPlugins: [remarkToc],
    shikiConfig: {
      theme: "catppuccin-mocha",
      wrap: true,
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
      fileSystemPath(),
      react(),
      Icons({ compiler: "svelte" }),
    ],
  },
});

function fileSystemPath() {
  return {
    name: "vite-plugin-file-system-path",
    /**
     *
     * @param {*} _
     * @param {string} id
     * @returns
     */
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
