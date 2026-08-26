import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  site: "https://vartifact.cc",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(),
    svelte(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      siteUrl: "https://vartifact.cc",
    }),
  ],
  vite: {
    plugins: [Icons({ compiler: "svelte" })],
    optimizeDeps: { include: ["astro/app/manifest", "@astrojs/svelte/server.js"] },
  },
  devToolbar: { enabled: false },
});
