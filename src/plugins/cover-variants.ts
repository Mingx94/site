import {
  createCoverVariantJob,
  type CoverVariantJob,
} from "@/lib/coverVariants";
import { definePlugin } from "emdash";
import type { ResolvedPlugin } from "emdash";

export function createPlugin(): ResolvedPlugin {
  return definePlugin({
    id: "cover-variants",
    version: "1.0.0",
    capabilities: ["content:read"],
    hooks: {
      "content:afterPublish": {
        timeout: 10_000,
        errorPolicy: "continue",
        handler: async (event, ctx) => {
          const job = createCoverVariantJob(event.collection, event.content);
          if (!job) return;

          const { env } = await import("cloudflare:workers");
          const queue: Queue<CoverVariantJob> | undefined = env.COVER_VARIANTS;
          if (!queue) {
            ctx.log.warn("Cover variant queue binding is unavailable", {
              contentId: job.contentId,
            });
            return;
          }

          await queue.send(job, { contentType: "json" });
          ctx.log.info("Queued cover variants", {
            contentId: job.contentId,
            mediaId: job.mediaId,
          });
        },
      },
    },
  });
}
