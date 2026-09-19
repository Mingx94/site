import type { PluginDescriptor } from "emdash";

export function staticPublishing(): PluginDescriptor {
  return {
    id: "static-publishing",
    version: "1.0.0",
    entrypoint: new URL("./static-publishing.ts", import.meta.url).pathname,
    capabilities: ["content:read"],
  };
}
