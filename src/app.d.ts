import "unplugin-icons/types/svelte";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void },
      ) => void;
    };
  }

  interface Array<T> {
    filter<S extends T>(
      predicate: (value: T, index: number, array: T[]) => value is S,
    ): S[];
  }

  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    interface Platform {
      env?: Cloudflare.Env;
    }
  }
}

export {};
