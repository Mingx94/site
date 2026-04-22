import { dev } from "$app/environment";
import { error } from "@sveltejs/kit";

// The editor is a local-only dev tool. Disable prerender + SSR for the
// whole route group, and refuse to serve anything under it outside dev —
// `hooks.server.ts` has a belt-and-suspenders early-404 as well.
export const prerender = false;
export const ssr = false;

export const load = () => {
  if (!dev) throw error(404);
};
