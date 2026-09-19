export interface StaticBuildJob {
  kind: "static-build";
  reason: string;
}

export async function enqueueStaticBuild(reason: string): Promise<void> {
  const { env } = await import("cloudflare:workers");
  // Local development never dispatches production builds.
  if (!env.STATIC_BUILD_HOOK) return;
  if (!env.STATIC_BUILDS) throw new Error("STATIC_BUILDS is missing");
  await env.STATIC_BUILDS.send({
    kind: "static-build",
    reason,
  } satisfies StaticBuildJob);
}

export async function triggerStaticBuild(hook: string): Promise<void> {
  const url = new URL(hook);
  if (
    url.origin !== "https://api.cloudflare.com" ||
    !url.pathname.startsWith("/client/v4/workers/builds/deploy_hooks/")
  ) {
    throw new Error("Invalid static build hook");
  }
  const response = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    throw new Error(`Static build trigger failed (${response.status})`);
  const body = (await response.json()) as {
    success?: boolean;
    result?: { build_uuid?: string };
  };
  if (!body.success || !body.result?.build_uuid)
    throw new Error("Static build trigger was not accepted");
  console.log(
    JSON.stringify({
      event: "static_build_requested",
      buildId: body.result.build_uuid,
    }),
  );
}

export function needsStaticRebuild(
  request: Request,
  response: Response,
): boolean {
  if (
    !["POST", "PUT", "PATCH", "DELETE"].includes(request.method) ||
    !response.ok
  )
    return false;
  const path = new URL(request.url).pathname;
  return (
    /^\/_emdash\/api\/taxonomies(?:\/|$)/.test(path) ||
    /^\/_emdash\/api\/content\/posts\/[^/]+\/terms(?:\/|$)/.test(path) ||
    /^\/_emdash\/api\/media(?:\/|$)/.test(path)
  );
}
