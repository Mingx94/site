import { describe, expect, it } from "vitest";
import { prefersMarkdown } from "./lib/accept";

describe("prefersMarkdown", () => {
  it("keeps normal browser requests as HTML", () => {
    expect(prefersMarkdown("text/html,*/*;q=0.8")).toBe(false);
  });

  it("uses markdown only when it is explicitly preferred", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/html;q=0.5,text/markdown;q=1")).toBe(true);
  });
});
