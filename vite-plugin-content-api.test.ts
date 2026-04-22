import { describe, expect, it } from "vitest";
import { resolve, sep } from "node:path";
import type { IncomingMessage } from "node:http";
import { isLocalRequest, safeResolve } from "./vite-plugin-content-api";

// The two helpers below are the full security boundary of the editor's
// dev-only content API: `safeResolve` prevents the client from writing
// outside the workspace root, and `isLocalRequest` prevents anyone on
// the LAN from reaching the API when the dev server is exposed with
// `--host`. Regressions here are catastrophic (arbitrary file write on
// the host machine), so each guard has its own dedicated test.

const ROOT = resolve("/workspace/content");

describe("safeResolve", () => {
  it("resolves a plain relative path inside the root", () => {
    expect(safeResolve(ROOT, "posts/hello.svx")).toBe(
      resolve(ROOT, "posts/hello.svx"),
    );
  });

  it("resolves the root itself when rel is empty or '.'", () => {
    expect(safeResolve(ROOT, "")).toBe(ROOT);
    expect(safeResolve(ROOT, ".")).toBe(ROOT);
  });

  it("rejects parent-directory escapes with ..", () => {
    expect(() => safeResolve(ROOT, "../etc/passwd")).toThrow(
      /path escapes workspace/,
    );
  });

  it("rejects nested parent-directory escapes", () => {
    expect(() => safeResolve(ROOT, "posts/../../secret")).toThrow(
      /path escapes workspace/,
    );
  });

  it("treats an absolute-looking client path as a relative segment", () => {
    // `path.join` keeps the second argument as a segment under the first,
    // so a client sending `/etc/passwd` lands inside the root rather than
    // escaping it. This is the desired behaviour: the guard we care about
    // is parent traversal, not absolute-looking strings.
    const joined = safeResolve(ROOT, "/etc/passwd");
    expect(joined.startsWith(ROOT + sep)).toBe(true);
  });

  it("rejects a sibling directory that merely shares the root prefix", () => {
    // Guard against naive `startsWith(root)` — `/workspace/content-evil`
    // starts with `/workspace/content` as a string but is a sibling path.
    const siblingEscape = `..${sep}${"content-evil"}${sep}file.txt`;
    expect(() => safeResolve(ROOT, siblingEscape)).toThrow(
      /path escapes workspace/,
    );
  });
});

function makeReq(remoteAddress: string | undefined): IncomingMessage {
  return { socket: { remoteAddress } } as unknown as IncomingMessage;
}

describe("isLocalRequest", () => {
  it("accepts IPv4 loopback", () => {
    expect(isLocalRequest(makeReq("127.0.0.1"))).toBe(true);
  });

  it("accepts IPv6 loopback", () => {
    expect(isLocalRequest(makeReq("::1"))).toBe(true);
  });

  it("accepts IPv4-mapped IPv6 loopback", () => {
    expect(isLocalRequest(makeReq("::ffff:127.0.0.1"))).toBe(true);
  });

  it("accepts unix-socket connections (empty remote address)", () => {
    expect(isLocalRequest(makeReq(""))).toBe(true);
    expect(isLocalRequest(makeReq(undefined))).toBe(true);
  });

  it("rejects LAN / public addresses", () => {
    expect(isLocalRequest(makeReq("192.168.1.20"))).toBe(false);
    expect(isLocalRequest(makeReq("10.0.0.5"))).toBe(false);
    expect(isLocalRequest(makeReq("::ffff:192.168.1.20"))).toBe(false);
    expect(isLocalRequest(makeReq("203.0.113.1"))).toBe(false);
  });
});
