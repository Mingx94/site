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
    const runMediaUsage = vi.fn<Dependencies["runMediaUsage"]>();
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
      runMediaUsage,
      purge,
    });
    await run("* * * * *", handler);
    expect(purge).toHaveBeenCalledExactlyOnceWith({
      tags: ["posts", "first", "second"],
    });
    expect(runMediaUsage).not.toHaveBeenCalled();
  });

  it("keeps media maintenance separate from publishing", async () => {
    const runTasks = vi.fn<Dependencies["runTasks"]>();
    const purge = vi.fn<Dependencies["purge"]>();
    const runMediaUsage = vi
      .fn<Dependencies["runMediaUsage"]>()
      .mockResolvedValue(undefined);
    const handler = createScheduledHandler({ runTasks, runMediaUsage, purge });
    await run("*/2 * * * *", handler);
    await run("unknown", handler);
    expect(runMediaUsage).toHaveBeenCalledOnce();
    expect(runTasks).not.toHaveBeenCalled();
    expect(purge).not.toHaveBeenCalled();
  });

  it("does not report successful invalidation when the purge rejects", async () => {
    const handler = createScheduledHandler({
      runTasks: async ({ onPublished }) => {
        await onPublished([{ collection: "posts", id: "first" }]);
        return { published: [] };
      },
      runMediaUsage: vi.fn<Dependencies["runMediaUsage"]>(),
      purge: vi
        .fn<Dependencies["purge"]>()
        .mockRejectedValue(new Error("Purge failed")),
    });
    await expect(run("* * * * *", handler)).rejects.toThrow("Purge failed");
  });

  it("reports a resolved API failure to EmDash's onPublished error handler", async () => {
    const handler = createScheduledHandler({
      runTasks: async ({ onPublished }) => {
        await onPublished([{ collection: "posts", id: "first" }]);
        return { published: [] };
      },
      runMediaUsage: vi.fn<Dependencies["runMediaUsage"]>(),
      purge: vi.fn<Dependencies["purge"]>().mockResolvedValue({
        success: false,
        errors: [{ code: 429, message: "Rate limited" }],
      }),
    });
    await expect(run("* * * * *", handler)).rejects.toThrow("Rate limited");
  });
});
