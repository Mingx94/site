import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../..");

function readProjectFile(path: string): string {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

describe("security discovery files", () => {
  it("publishes security.txt under the well-known path", () => {
    const securityTxtPath = resolve(
      repoRoot,
      "static/.well-known/security.txt",
    );

    expect(existsSync(securityTxtPath)).toBe(true);

    const body = readFileSync(securityTxtPath, "utf8");
    expect(body).toContain("Contact: mailto:mingxcv@gmail.com");
    expect(body).toContain(
      "Canonical: https://vartifact.cc/.well-known/security.txt",
    );
    expect(body).toContain("Preferred-Languages: zh-TW, en");
    expect(body).toMatch(/^Expires: 2027-06-06T00:00:00Z$/m);
  });

  it("serves security.txt with explicit text headers", () => {
    const headers = readProjectFile("_headers");

    expect(headers).toMatch(
      /\/\.well-known\/security\.txt\r?\n\s+Content-Type: text\/plain; charset=utf-8\r?\n\s+Cache-Control: public, max-age=300, s-maxage=3600/,
    );
  });
});
