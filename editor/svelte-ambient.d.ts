declare module 'svelte/internal/client';
declare module 'svelte/internal/disclose-version';

// Site components imported via $content alias live outside the tsconfig
// `include` glob, so svelte-check can't infer their `Component` type.
// Treat them as opaque Svelte components — runtime behaviour is unchanged.
declare module '$content/components/*.svelte' {
  import type { Component } from 'svelte';
  const value: Component<Record<string, unknown>>;
  export default value;
}
