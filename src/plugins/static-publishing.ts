import { definePlugin } from "emdash";
import { enqueueStaticBuild } from "../lib/staticPublishing";

export function createPlugin() {
  const changed = async (event: { collection: string }) => {
    if (event.collection === "posts") await enqueueStaticBuild("posts changed");
  };
  return definePlugin({
    id: "static-publishing",
    version: "1.0.0",
    capabilities: ["content:read"],
    hooks: {
      "content:afterPublish": changed,
      "content:afterUnpublish": changed,
      "content:afterDelete": changed,
      "content:afterRestore": changed,
    },
  });
}
