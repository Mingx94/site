/// <reference types="astro/client" />
/// <reference types="emdash/locals" />

declare namespace App {
  interface Locals {}
}

interface Env {
  EMDASH_ENCRYPTION_KEY?: string;
}

declare namespace Cloudflare {
  interface Env {
    EMDASH_ENCRYPTION_KEY?: string;
  }
}
