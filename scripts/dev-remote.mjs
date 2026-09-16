import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const astroPackageUrl = import.meta.resolve("astro/package.json");
const astroCliPath = fileURLToPath(new URL("./bin/astro.mjs", astroPackageUrl));

const child = spawn(
  process.execPath,
  [astroCliPath, "dev", ...process.argv.slice(2)],
  {
    env: {
      ...process.env,
      CLOUDFLARE_ENV: "remote-data",
    },
    stdio: "inherit",
  },
);

child.on("error", (error) => {
  console.error("Unable to start Astro remote-data development:", error);
  process.exitCode = 1;
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
