import { describe, it, expect } from "vitest";
import { parseDoc, serializeFrontmatter, composeDoc } from "./frontmatter";

describe("parseDoc", () => {
  it("parses scalar values", () => {
    const { fm, body } = parseDoc(`---
title: Hello
draft: true
count: 3
---

body text`);
    expect(fm).toEqual({ title: "Hello", draft: true, count: 3 });
    expect(body.trim()).toBe("body text");
  });

  it("parses YAML list syntax (the bug the old regex parser had)", () => {
    const { fm } = parseDoc(`---
tags:
  - svelte
  - mdsvex
  - vite
---

x`);
    expect(fm.tags).toEqual(["svelte", "mdsvex", "vite"]);
  });

  it("parses flow-style lists too", () => {
    const { fm } = parseDoc(`---
tags: [a, b, c]
---
`);
    expect(fm.tags).toEqual(["a", "b", "c"]);
  });

  it("parses multi-line strings", () => {
    const { fm } = parseDoc(`---
description: |
  line one
  line two
---
`);
    expect(fm.description).toBe("line one\nline two\n");
  });

  it("returns empty fm when no frontmatter block present", () => {
    const { fm, body } = parseDoc("no frontmatter here");
    expect(fm).toEqual({});
    expect(body).toBe("no frontmatter here");
  });

  it("returns empty fm on malformed YAML rather than throwing", () => {
    // Intentionally broken YAML (bad indentation + unclosed bracket)
    const { fm, body } = parseDoc(`---
tags: [a, b
---

body`);
    expect(fm).toEqual({});
    // Body is preserved so the editor can still open the file
    expect(body.trim()).toBe("body");
  });
});

describe("serializeFrontmatter round-trip", () => {
  it("round-trips list syntax (the key regression the regex parser had)", () => {
    const src = `---
tags:
  - a
  - b
---

body`;
    const { fm, body } = parseDoc(src);
    const roundtrip = composeDoc(fm, body);
    const reparsed = parseDoc(roundtrip);
    expect(reparsed.fm).toEqual(fm);
  });

  it("round-trips nested objects", () => {
    const fm = {
      meta: { author: "Mike", year: 2026 },
      draft: false,
    };
    const reparsed = parseDoc(composeDoc(fm, "body"));
    expect(reparsed.fm).toEqual(fm);
  });

  it("returns empty string for empty frontmatter", () => {
    expect(serializeFrontmatter({})).toBe("");
  });

  it("emits a YAML block wrapped in --- fences", () => {
    const out = serializeFrontmatter({ title: "hi" });
    expect(out.startsWith("---\n")).toBe(true);
    expect(out.endsWith("\n---")).toBe(true);
    expect(out).toContain("title: hi");
  });

  it("quotes strings that would otherwise be ambiguous YAML", () => {
    // Values that could be parsed as booleans, numbers, or special forms
    // must be quoted to round-trip correctly.
    const out = serializeFrontmatter({ flag: "true", num: "123" });
    // Either quote style is fine as long as re-parse yields strings.
    const reparsed = parseDoc(`${out}\n\nbody`);
    expect(reparsed.fm).toEqual({ flag: "true", num: "123" });
  });
});
