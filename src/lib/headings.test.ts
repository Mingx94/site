import { describe, expect, it } from "vitest";
import { headingId } from "./headings";

describe("headingId", () => {
  it("keeps Chinese headings linkable and normalizes full-width Latin text", () => {
    expect(headingId("開始使用 ＡＳＴＲＯ！", new Set())).toBe(
      "開始使用-astro",
    );
  });

  it("avoids collisions with existing page IDs and repeated headings", () => {
    const used = new Set(["main", "main-2"]);
    expect(headingId("Main", used)).toBe("main-3");
    expect(headingId("Main", used)).toBe("main-4");
    expect(headingId("✨", used)).toBe("section");
    expect(headingId("✨", used)).toBe("section-2");
  });
});
