/// <reference types="astro/client" />
/// <reference types="emdash/locals" />

declare namespace App {
  interface Locals {}
}

interface Env {
  TURNSTILE_SECRET_KEY?: string;
  EMDASH_ENCRYPTION_KEY?: string;
}

declare namespace Cloudflare {
  interface Env {
    TURNSTILE_SECRET_KEY?: string;
    EMDASH_ENCRYPTION_KEY?: string;
  }
}
