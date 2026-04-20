import { defineConfig } from "vitest/config";
import path from "node:path";

// Separate from vite.config.ts so tests don't pull in the full SvelteKit
// plugin graph (Cloudflare adapter, enhanced-img, Tailwind, React for OG,
// unplugin-icons). Unit tests target pure-JS helpers; integration goes
// through explicit fetch in the test body.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      $content: path.resolve(import.meta.dirname, "src/content"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
