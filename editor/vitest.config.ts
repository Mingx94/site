import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";

// Runs the Svelte plugin so `.svelte.ts` files (runes-enabled state modules)
// are transformed before vitest picks them up. Without this, module-level
// `$state()` calls blow up at load time.
export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    alias: {
      $lib: path.resolve(import.meta.dirname, "src/lib"),
      $components: path.resolve(import.meta.dirname, "src/components"),
      $state: path.resolve(import.meta.dirname, "src/lib/state"),
      $preview: path.resolve(import.meta.dirname, "src/preview"),
      $content: path.resolve(import.meta.dirname, "../src/content"),
      "@": path.resolve(import.meta.dirname, "../src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
