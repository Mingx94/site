import { readFileSync } from "node:fs";

/** Both builds share templates; only the public build reads the frozen snapshot. */
export function staticBuildIntegration(enabled) {
  return {
    name: "site-static-publishing",
    hooks: {
      "astro:config:setup"({ injectRoute, updateConfig }) {
        injectRoute({
          pattern: "/_site/snapshot.json",
          entrypoint: "./src/server/build-snapshot.ts",
          prerender: false,
        });
        if (!enabled) return;
        updateConfig({
          vite: {
            plugins: [
              {
                name: "site-published-snapshot",
                resolveId(id) {
                  if (id === "virtual:site-published-posts")
                    return "\0site-published-posts";
                },
                load(id) {
                  if (id !== "\0site-published-posts") return;
                  const snapshot = JSON.parse(
                    readFileSync(
                      new URL("../build/published-posts.json", import.meta.url),
                      "utf8",
                    ),
                  );
                  if (snapshot.version !== 1 || !Array.isArray(snapshot.posts))
                    throw new Error("Invalid published snapshot");
                  return `export default ${JSON.stringify(snapshot.posts)};`;
                },
              },
            ],
          },
        });
      },
      "astro:route:setup"({ route }) {
        if (!enabled) return;
        if (
          route.component.startsWith("src/pages/") &&
          !route.component.includes("/covers/")
        ) {
          route.prerender = true;
        }
      },
    },
  };
}
