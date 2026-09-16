import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { coverVariants } from "./src/plugins/cover-variants.config.ts";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import Icons from "unplugin-icons/vite";

const siteUrl = "https://vartifact.cc";

export default defineConfig({
  site: siteUrl,
  output: "server",
  i18n: {
    defaultLocale: "zh-TW",
    locales: ["zh-TW"],
    routing: "manual",
  },
  build: {
    inlineStylesheets: "always",
  },
  adapter: cloudflare(),
  cache: {
    provider: cacheCloudflare(),
  },
  routeRules: {
    "/": { maxAge: 300, swr: 60, tags: ["posts"] },
    "/blog": { maxAge: 300, swr: 60, tags: ["posts"] },
    "/blog/[slug]": { maxAge: 300, swr: 3600, tags: ["posts"] },
    "/blog/[slug].md": { maxAge: 300, swr: 3600, tags: ["posts"] },
    "/_image": {
      maxAge: 31536000,
      swr: 86400,
      tags: ["images"],
    },
  },
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB", session: "auto" }),
      storage: r2({ binding: "MEDIA" }),
      siteUrl,
      plugins: [coverVariants()],
    }),
  ],
  vite: {
    plugins: [Icons({ compiler: "astro" })],
    optimizeDeps: {
      include: ["astro/app/manifest", "astro/logger/console"],
    },
  },
  devToolbar: { enabled: false },
});
