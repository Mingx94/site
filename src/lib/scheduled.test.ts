import { describe, expect, it, vi } from "vitest";
import { createScheduledHandler } from "./scheduled";

type Dependencies = Parameters<typeof createScheduledHandler>[0];

function run(cron: string, handler: ReturnType<typeof createScheduledHandler>) {
  const tasks: Promise<unknown>[] = [];
  handler(
    { cron } as ScheduledController,
    {} as Env,
    {
      waitUntil: (task: Promise<unknown>) => tasks.push(task),
    } as unknown as ExecutionContext,
  );
  return Promise.all(tasks);
}

describe("scheduled publishing", () => {
  it("awaits the purge for each published batch and deduplicates cache tags", async () => {
    const purge = vi
      .fn<Dependencies["purge"]>()
      .mockResolvedValue({ success: true, errors: [] });
    const refs = [
      { collection: "posts", id: "first" },
      { collection: "posts", id: "second" },
    ];
    const handler = createScheduledHandler({
      runTasks: async ({ onPublished }) => {
        await onPublished(refs);
        expect(purge).toHaveResolved();
        await onPublished([]);
        return { published: refs };
      },
      purge,
    });
    await run("0 18 * * *", handler);
    expect(purge).toHaveBeenCalledExactlyOnceWith({
      tags: ["posts", "first", "second"],
    });
  });

  it("ignores unknown cron triggers", async () => {
    const runTasks = vi.fn<Dependencies["runTasks"]>();
    const purge = vi.fn<Dependencies["purge"]>();
    const handler = createScheduledHandler({ runTasks, purge });
    await run("* * * * *", handler);
    await run("*/30 * * * *", handler);
    await run("*/2 * * * *", handler);
    await run("unknown", handler);
    expect(runTasks).not.toHaveBeenCalled();
    expect(purge).not.toHaveBeenCalled();
  });

  it("does not report successful invalidation when the purge rejects", async () => {
    const handler = createScheduledHandler({
      runTasks: async ({ onPublished }) => {
        await onPublished([{ collection: "posts", id: "first" }]);
        return { published: [] };
      },
      purge: vi
        .fn<Dependencies["purge"]>()
        .mockRejectedValue(new Error("Purge failed")),
    });
    await expect(run("0 18 * * *", handler)).rejects.toThrow("Purge failed");
  });

  it("reports a resolved API failure to EmDash's onPublished error handler", async () => {
    const handler = createScheduledHandler({
      runTasks: async ({ onPublished }) => {
        await onPublished([{ collection: "posts", id: "first" }]);
        return { published: [] };
      },
      purge: vi.fn<Dependencies["purge"]>().mockResolvedValue({
        success: false,
        errors: [{ code: 429, message: "Rate limited" }],
      }),
    });
    await expect(run("0 18 * * *", handler)).rejects.toThrow("Rate limited");
  });
});
