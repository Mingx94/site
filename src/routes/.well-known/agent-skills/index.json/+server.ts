import type { RequestHandler } from "./$types";

export const prerender = true;

/**
 * Agent Skills Discovery index (RFC v0.2.0,
 * https://github.com/cloudflare/agent-skills-discovery-rfc).
 *
 * The site does not currently publish any skills. The index is still
 * served so agents get a definitive "no skills" answer instead of a 404
 * and can revisit the URL later. When a skill is added, append an entry
 * with { name, type, description, url, sha256 } — the sha256 must be the
 * digest of the fetched skill document.
 */
export const GET: RequestHandler = () => {
  const body = {
    $schema:
      "https://raw.githubusercontent.com/cloudflare/agent-skills-discovery-rfc/main/schema.json",
    skills: [],
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
