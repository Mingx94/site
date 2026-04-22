import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";

// Separate from vite.config.ts so tests don't pull in the full SvelteKit
// plugin graph (Cloudflare adapter, enhanced-img, Tailwind, React for OG,
// unplugin-icons). Unit tests target pure-JS helpers; integration goes
// through explicit fetch in the test body.
//
// The Svelte plugin is still required so `.svelte.ts` files (runes-enabled
// state modules under src/lib/editor/state/) compile at test-import time;
// without it, module-level `$state()` calls throw ReferenceError.
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      $content: path.resolve(import.meta.dirname, "src/content"),
      $lib: path.resolve(import.meta.dirname, "src/lib"),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "*.test.ts"],
    environment: "node",
  },
});
