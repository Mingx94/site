import handler, { createScheduledHandler } from "@emdash-cms/cloudflare/worker";
import {
  CoverVariantError,
  createCloudflareCoverDependencies,
  generateCoverVariants,
  isCoverVariantJob,
  type CoverVariantJob,
} from "@/lib/coverVariants";

async function handleCoverVariantQueue(
  batch: MessageBatch<CoverVariantJob>,
  env: Env,
): Promise<void> {
  const dependencies = createCloudflareCoverDependencies(env);

  for (const message of batch.messages) {
    if (!isCoverVariantJob(message.body)) {
      console.error(
        JSON.stringify({
          event: "cover_variants_invalid_message",
          messageId: message.id,
        }),
      );
      message.ack();
      continue;
    }

    try {
      const result = await generateCoverVariants(message.body, dependencies);
      console.log(
        JSON.stringify({
          event: "cover_variants_complete",
          contentId: message.body.contentId,
          mediaId: message.body.mediaId,
          ...result,
        }),
      );
      message.ack();
    } catch (error) {
      const retryable =
        !(error instanceof CoverVariantError) || error.retryable;
      console.error(
        JSON.stringify({
          event: "cover_variants_failed",
          contentId: message.body.contentId,
          mediaId: message.body.mediaId,
          attempt: message.attempts,
          retryable,
          error: error instanceof Error ? error.message : String(error),
        }),
      );

      if (retryable) {
        const delaySeconds = Math.min(
          30 * 2 ** Math.max(message.attempts - 1, 0),
          900,
        );
        message.retry({ delaySeconds });
      } else {
        message.ack();
      }
    }
  }
}

export default {
  ...handler,
  scheduled: createScheduledHandler(),
  queue: handleCoverVariantQueue,
} satisfies ExportedHandler<Env, CoverVariantJob>;
