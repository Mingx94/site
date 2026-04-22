// Post-build guard: verify that the editor's heavyweight browser-side
// deps (svelte/compiler + mdsvex, ~500KB combined) never end up inside
// the Cloudflare Worker script, and that overall Worker size stays in
// a reasonable band.
//
// Runs after `npm run build`. Failing here signals one of two regressions:
//   1. Rollup lost the dynamic-import boundary inside `preview/+page.svelte`
//      and inlined the compiler chunk into the request-path bundle.
//   2. A new dependency that shouldn't ship to Workers made it in.
//
// The size threshold is intentionally loose. The goal is "don't let
// something 5× normal slip through silently" — not to track every
// kilobyte. Tighten if this proves too noisy.

import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const WORKER_JS = resolve(
  import.meta.dirname,
  "..",
  ".svelte-kit",
  "cloudflare",
  "_worker.js",
);

// Upper bound on the uncompressed Worker script. Chosen so the current
// main-branch size sits comfortably under it; if a PR blows past this
// threshold, at least one person stops to ask "why".
const MAX_SIZE_BYTES = 1_500_000;

// Patterns that imply the browser-side compile pipeline leaked into the
// request path. Check for module-URL-style references from the Rollup
// chunk map — a direct `from "svelte/compiler"` statement in the Worker
// bundle is unambiguous evidence of a broken dynamic-import boundary.
const FORBIDDEN_PATTERNS = [
  /\bfrom\s*["']svelte\/compiler["']/,
  /\brequire\(\s*["']svelte\/compiler["']\s*\)/,
  /\bfrom\s*["']mdsvex["']/,
];

try {
  const { size } = statSync(WORKER_JS);
  console.log(
    `[check-worker-size] ${WORKER_JS}: ${(size / 1024).toFixed(1)} KB`,
  );
  if (size > MAX_SIZE_BYTES) {
    console.error(
      `[check-worker-size] FAIL: Worker script is ${size} bytes, exceeds ceiling of ${MAX_SIZE_BYTES}.`,
    );
    process.exit(1);
  }

  const contents = readFileSync(WORKER_JS, "utf8");
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(contents)) {
      console.error(
        `[check-worker-size] FAIL: Worker bundle references ${pattern}. ` +
          `svelte/compiler or mdsvex must only be reachable through the ` +
          `dynamic import in src/routes/(editor)/__editor/preview/+page.svelte.`,
      );
      process.exit(1);
    }
  }

  console.log("[check-worker-size] OK");
} catch (e) {
  const err = e as NodeJS.ErrnoException;
  if (err.code === "ENOENT") {
    console.error(
      `[check-worker-size] FAIL: ${WORKER_JS} not found — run \`npm run build\` first.`,
    );
    process.exit(1);
  }
  throw e;
}
