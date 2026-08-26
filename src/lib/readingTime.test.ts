import { describe, it, expect } from "vitest";
import type { PortableTextBlock } from "emdash/client";
import { getReadingTime } from "./readingTime";

const block = (text: string): PortableTextBlock => ({
  _type: "block",
  children: [{ _type: "span", text }],
});

describe("getReadingTime", () => {
  it("returns at least 1 minute", () => {
    expect(getReadingTime([])).toBe(1);
    expect(getReadingTime([block("a")])).toBe(1);
  });

  it("counts mixed CJK and English text across blocks", () => {
    const content = [
      block("中".repeat(500)),
      block("word ".repeat(200).trim()),
    ];
    expect(getReadingTime(content)).toBe(2);
  });
});
