import { describe, it, expect } from "vitest";
import { isValidSlug, slugFromArticlePath } from "./posts.svelte";

describe("isValidSlug", () => {
  it("accepts lowercase alphanumeric + hyphens, must start with alnum", () => {
    expect(isValidSlug("hello")).toBe(true);
    expect(isValidSlug("hello-world")).toBe(true);
    expect(isValidSlug("post-2026")).toBe(true);
    expect(isValidSlug("a")).toBe(true);
    expect(isValidSlug("2023-year-in-review")).toBe(true);
  });

  it("rejects leading hyphen", () => {
    expect(isValidSlug("-bad")).toBe(false);
  });

  it("rejects uppercase", () => {
    expect(isValidSlug("Hello")).toBe(false);
    expect(isValidSlug("HELLO")).toBe(false);
  });

  it("rejects spaces and other punctuation", () => {
    expect(isValidSlug("hello world")).toBe(false);
    expect(isValidSlug("hello_world")).toBe(false);
    expect(isValidSlug("hello.world")).toBe(false);
    expect(isValidSlug("hello/world")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidSlug("")).toBe(false);
  });

  it("rejects non-ASCII even if case would pass", () => {
    expect(isValidSlug("文章")).toBe(false);
  });
});

describe("slugFromArticlePath", () => {
  it("extracts slug from canonical path", () => {
    expect(slugFromArticlePath("posts/why-astro/article.svx")).toBe("why-astro");
  });

  it("returns null for non-post paths", () => {
    expect(slugFromArticlePath("posts/why-astro/cover.jpg")).toBeNull();
    expect(slugFromArticlePath("components/Cover.svelte")).toBeNull();
    expect(slugFromArticlePath("why-astro/article.svx")).toBeNull();
    expect(slugFromArticlePath("posts/why-astro/nested/article.svx")).toBeNull();
  });

  it("returns null for nullish / empty input", () => {
    expect(slugFromArticlePath(null)).toBeNull();
    expect(slugFromArticlePath(undefined)).toBeNull();
    expect(slugFromArticlePath("")).toBeNull();
  });
});
