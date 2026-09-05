import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { INCREMENT_VIEWS_SQL } from "./blog";

describe("blog counters", () => {
  it("seeds legacy views once and increments existing counts", () => {
    const database = new DatabaseSync(":memory:");
    database.exec(
      readFileSync(
        new URL("../../../migrations/0002-blog-counters.sql", import.meta.url),
        "utf8",
      ),
    );
    const increment = database.prepare(INCREMENT_VIEWS_SQL);

    expect(increment.get("post", 5)).toEqual({ value: 6 });
    expect(increment.get("post", 100)).toEqual({ value: 7 });
    expect(increment.get("empty", 0)).toEqual({ value: 1 });

    database.close();
  });
});
