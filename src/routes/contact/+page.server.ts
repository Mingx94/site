import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ platform }) => {
  return {
    turnstileSiteKey: platform?.env?.TURNSTILE_SITE_KEY ?? "",
  };
};
