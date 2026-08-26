import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { cloudflareEmail } from "@emdash-cms/cloudflare/plugins";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import Icons from "unplugin-icons/vite";

const siteUrl =
  process.env.CLOUDFLARE_ENV === "preview"
    ? "https://blog-preview.vartifact.workers.dev"
    : "https://vartifact.cc";

export default defineConfig({
  site: siteUrl,
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      siteUrl,
      plugins: [
        formsPlugin({ defaultSpamProtection: "turnstile" }),
        cloudflareEmail({
          binding: "SEND_EMAIL",
          from: { email: "michael.tsai@vartifact.cc", name: "Vartifact" },
        }),
      ],
    }),
  ],
  vite: {
    plugins: [Icons({ compiler: "astro" })],
    optimizeDeps: {
      include: ["astro/app/manifest"],
    },
  },
  devToolbar: { enabled: false },
});
