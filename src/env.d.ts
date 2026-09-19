/// <reference types="astro/client" />
/// <reference types="emdash/locals" />

declare module "shiki/onig.wasm" {
  const wasm: WebAssembly.Module;
  export default wasm;
}

declare namespace App {
  interface Locals {}
}

interface Env {
  EMDASH_ENCRYPTION_KEY?: string;
  STATIC_BUILD_TOKEN?: string;
  STATIC_BUILD_HOOK?: string;
}

declare namespace Cloudflare {
  interface Env {
    EMDASH_ENCRYPTION_KEY?: string;
    STATIC_BUILD_TOKEN?: string;
    STATIC_BUILD_HOOK?: string;
  }
}

declare module "virtual:site-published-posts" {
  const posts: import("./lib/posts").Post[];
  export default posts;
}
