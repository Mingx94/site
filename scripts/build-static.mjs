import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { verifyStaticBuild } from "./verify-static-build.mjs";

const token = process.env.STATIC_BUILD_TOKEN;
if (!token)
  throw new Error(
    "STATIC_BUILD_TOKEN is required; refusing to build from local or stale content",
  );
const origin = new URL(process.env.CMS_ORIGIN ?? "https://vartifact.cc");
if (
  origin.protocol !== "https:" &&
  origin.hostname !== "localhost" &&
  origin.hostname !== "127.0.0.1"
) {
  throw new Error("CMS_ORIGIN must use HTTPS");
}
let snapshot;
for (let attempt = 1; attempt <= 4; attempt++) {
  try {
    const response = await fetch(new URL("/_site/snapshot.json", origin), {
      headers: { "x-static-build-token": token },
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok)
      throw new Error(`CMS snapshot returned ${response.status}`);
    snapshot = await response.json();
    if (
      snapshot.version !== 1 ||
      !Array.isArray(snapshot.posts) ||
      snapshot.posts.some((post) => post.draft)
    ) {
      throw new Error("CMS did not return a published snapshot");
    }
    break;
  } catch (error) {
    if (attempt === 4) throw error;
    console.warn(`Snapshot attempt ${attempt} failed; retrying`);
    await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
  }
}
await mkdir(new URL("../build/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../build/published-posts.json", import.meta.url),
  JSON.stringify(snapshot),
);
console.log(
  `Building ${snapshot.posts.length} published posts from ${snapshot.generatedAt}`,
);
const astroCli = fileURLToPath(
  new URL("./bin/astro.mjs", import.meta.resolve("astro/package.json")),
);
const result = spawnSync(process.execPath, [astroCli, "build"], {
  stdio: "inherit",
  env: { ...process.env, SITE_STATIC_BUILD: "1" },
});
if (result.status !== 0) process.exit(result.status ?? 1);
await verifyStaticBuild();
