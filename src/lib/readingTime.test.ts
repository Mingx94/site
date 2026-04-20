import { describe, it, expect } from "vitest";
import { getReadingTime } from "./readingTime";

describe("getReadingTime", () => {
  it("returns at least 1 minute for any non-empty input", () => {
    expect(getReadingTime("a")).toBeGreaterThanOrEqual(1);
    expect(getReadingTime("")).toBe(1);
  });

  it("counts CJK characters at 500/min", () => {
    // 1000 chars / 500 = 2 minutes
    const text = "中".repeat(1000);
    expect(getReadingTime(text)).toBe(2);
  });

  it("counts English words at 200/min", () => {
    // 400 words / 200 = 2 minutes
    const text = "word ".repeat(400).trim();
    expect(getReadingTime(text)).toBe(2);
  });

  it("handles mixed CJK + English additively", () => {
    // 500 CJK (1 min) + 200 words (1 min) = 2 min
    const text = "中".repeat(500) + " " + "word ".repeat(200).trim();
    expect(getReadingTime(text)).toBe(2);
  });

  it("strips YAML frontmatter from the count", () => {
    const withFm = `---
title: "A very long title that would add to the count otherwise"
description: "Lots of extra words in the description lorem ipsum dolor sit amet"
---

一`;
    // Without stripping, the frontmatter alone would push this above 1 min.
    // After stripping, only "一" counts → 1 minute (the floor).
    expect(getReadingTime(withFm)).toBe(1);
  });

  it("strips code fences", () => {
    const withCode = "中".repeat(100) + "\n```ts\n" + "x ".repeat(5000) + "\n```";
    // Only the 100 CJK chars survive → 1 min (the floor).
    expect(getReadingTime(withCode)).toBe(1);
  });

  it("strips inline code and markdown syntax", () => {
    // 1000 chars of CJK + an inline code span + a heading marker. After
    // stripping, only the 1000 `中` + 2 CJK heading chars remain (1002/500
    // → ceil = 3 min). Demonstrates that `ignored` in backticks doesn't
    // leak through into the word count.
    const text = "# 標題\n\n`ignored words here` " + "中".repeat(1000);
    expect(getReadingTime(text)).toBe(3);
  });

  it("strips image tags but keeps link text", () => {
    const text =
      "![cover](/foo.jpg) [看這裡](/bar) " + "中".repeat(500);
    // link text "看這裡" (3 chars) + 500 CJK ≈ 1.006 min → ceil to 2
    expect(getReadingTime(text)).toBe(2);
  });
});
