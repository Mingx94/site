import "unplugin-icons/types/svelte";

declare global {
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
    // interface Platform {}
  }
}

export {};
