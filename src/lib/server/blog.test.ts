import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { COUNTER_CHANGE_SQL } from "./blog";

describe("blog counters", () => {
  it("seeds legacy values and updates one row without going below zero", () => {
    const database = new DatabaseSync(":memory:");
    database.exec(
      readFileSync(
        new URL("../../../migrations/0002-blog-counters.sql", import.meta.url),
        "utf8",
      ),
    );
    const change = database.prepare(COUNTER_CHANGE_SQL);

    expect(change.get("post", "views", 5, 1, 1)).toEqual({ value: 6 });
    expect(change.get("post", "views", 5, 1, 1)).toEqual({ value: 7 });
    expect(change.get("post", "views", 5, -1, -1)).toEqual({ value: 6 });
    expect(change.get("empty", "views", 0, -1, -1)).toEqual({ value: 0 });

    database.close();
  });
});
