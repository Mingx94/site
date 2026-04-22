// Ambient declarations for the editor's preview compile pipeline.
//
// `svelte/internal/client` and `svelte/internal/disclose-version` are
// private runtime modules that Svelte doesn't publish types for — we
// import them at compile time in `preview/compile.ts` so the generated
// code can link against the same Svelte runtime instance the rest of
// the app uses.

declare module "svelte/internal/client";
declare module "svelte/internal/disclose-version";
