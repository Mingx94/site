interface PublishedRef {
  collection: string;
  id: string;
}

interface ScheduledDependencies {
  runTasks: (options: {
    onPublished: (refs: PublishedRef[]) => Promise<void>;
  }) => Promise<{ published: PublishedRef[] }>;
  purge: (options: { tags: string[] }) => Promise<CachePurgeResult>;
}

/** Use the public Workers cache API for scheduled publishing invalidation. */
export function createScheduledHandler({
  runTasks,
  purge,
}: ScheduledDependencies): ExportedHandlerScheduledHandler<Env> {
  return (controller, _env, ctx) => {
    if (controller.cron === "* * * * *") {
      ctx.waitUntil(
        runTasks({
          async onPublished(refs) {
            const tags = [
              ...new Set(
                refs.flatMap(({ collection, id }) => [collection, id]),
              ),
            ];
            if (!tags.length) return;
            const result = await purge({ tags });
            if (!result.success) {
              throw new Error(
                `Scheduled cache purge failed: ${JSON.stringify(result.errors)}`,
              );
            }
          },
        }),
      );
    }
  };
}
