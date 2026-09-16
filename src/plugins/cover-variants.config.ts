import type { PluginDescriptor } from "emdash";

export function coverVariants(): PluginDescriptor {
  return {
    id: "cover-variants",
    version: "1.0.0",
    entrypoint: new URL("./cover-variants.ts", import.meta.url).pathname,
    capabilities: ["content:read"],
  };
}
