import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { coverVariants } from "./src/plugins/cover-variants.config.ts";
import { staticPublishing } from "./src/plugins/static-publishing.config.ts";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import expressiveCode from "astro-expressive-code";
import { fileURLToPath } from "node:url";
import { staticBuildIntegration } from "./scripts/static-build-integration.mjs";

const siteUrl = "https://vartifact.cc";
const staticBuild = process.env.SITE_STATIC_BUILD === "1";

export default defineConfig({
  site: siteUrl,
  output: "server",
  outDir: staticBuild ? "./dist/static-build" : "./dist/cms",
  i18n: {
    defaultLocale: "zh-TW",
    locales: ["zh-TW"],
    routing: "manual",
  },
  build: {
    format: "file",
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
    "/tags": { maxAge: 300, swr: 60, tags: ["posts"] },
    "/tags/[tag]": { maxAge: 300, swr: 60, tags: ["posts"] },
    "/rss.xml": { maxAge: 300, swr: 60, tags: ["posts"] },
    "/sitemap.xml": { maxAge: 300, swr: 60, tags: ["posts"] },
    "/llms.txt": { maxAge: 300, swr: 60, tags: ["posts"] },
    "/_image": {
      maxAge: 31536000,
      swr: 86400,
      tags: ["images"],
    },
  },
  integrations: [
    expressiveCode(),
    react(),
    emdash({
      // EmDash's experimental batching reduces D1 round trips within each request.
      database: d1({ binding: "DB", session: "auto", coalesce: true }),
      storage: r2({ binding: "MEDIA" }),
      siteUrl,
      plugins: [coverVariants(), staticPublishing()],
    }),
    staticBuildIntegration(staticBuild),
  ],
  vite: {
    resolve: {
      alias: [
        ...(staticBuild
          ? [
              {
                find: /^@\/lib\/posts$/,
                replacement: fileURLToPath(
                  new URL("./src/lib/staticPosts.ts", import.meta.url),
                ),
              },
              {
                find: /^@\/lib\/postNavigation$/,
                replacement: fileURLToPath(
                  new URL("./src/lib/staticPostNavigation.ts", import.meta.url),
                ),
              },
            ]
          : []),
        {
          find: /^shiki\/wasm$/,
          replacement: fileURLToPath(
            new URL("./src/lib/shikiWasm.ts", import.meta.url),
          ),
        },
      ],
    },
    plugins: [
      {
        name: "sienna-worker-dependencies",
        configEnvironment(environment) {
          // Bundle the renderer's CommonJS dependencies before loading it in workerd.
          if (environment !== "client") {
            return {
              optimizeDeps: {
                include: ["postcss", "rehype-expressive-code/hast"],
              },
            };
          }
        },
      },
    ],
    optimizeDeps: {
      include: ["astro/app/manifest", "astro/logger/console"],
    },
  },
  devToolbar: { enabled: false },
});
