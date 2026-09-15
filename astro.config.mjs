import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import Icons from "unplugin-icons/vite";

const isPreview = process.env.CLOUDFLARE_ENV === "preview";
const siteUrl = isPreview
  ? "https://blog-preview.vartifact.workers.dev"
  : "https://vartifact.cc";

export default defineConfig({
  site: siteUrl,
  output: "server",
  adapter: cloudflare(),
  cache: {
    provider: cacheCloudflare(),
  },
  routeRules: {
    "/": { maxAge: 300, swr: 60, tags: ["posts"] },
    "/blog": { maxAge: 300, swr: 60, tags: ["posts"] },
  },
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      siteUrl,
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
