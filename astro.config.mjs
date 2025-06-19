// @ts-check
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import compressor from "astro-compressor";
import { defineConfig } from "astro/config";
import remarkToc from "remark-toc";
import Icons from "unplugin-icons/vite";
import config from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url,
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/elements/"),
    }),
    AutoImport({
      imports: [
        "@/components/md/Button",
        "@/components/md/Accordion",
        "@/components/md/Notice",
        "@/components/md/Video",
        "@/components/md/Tabs",
        "@/components/md/Tab",
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
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
    compressor({ brotli: true, gzip: false }),
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
      Icons({ compiler: "jsx", jsx: "react" }),
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
