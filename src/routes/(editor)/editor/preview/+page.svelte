<script lang="ts">
  // The preview iframe that DynamicSvx.svelte mounts at `/__editor/preview`.
  // Originally `editor/preview-host.html` + `editor/src/preview/iframe-entry.ts`
  // — now a SvelteKit route so the whole editor lives inside the same
  // SvelteKit project.
  //
  // `compile.ts` eagerly imports `mdsvex` + `svelte/compiler` (~500KB).
  // Dynamic-importing it inside `onMount` forces Rollup to emit a separate
  // chunk, so this code path never inflates the main Worker bundle that
  // ships to Cloudflare.
  //
  // Protocol (unchanged from iframe-entry.ts):
  //   parent → iframe: { type:'compile', source, frontmatter }
  //   iframe → parent: { type:'preview-ready' } once on load
  //   iframe → parent: { type:'preview-rendered' } on mount
  //   iframe → parent: { type:'preview-error', message }
  //   iframe → parent: { type:'preview-resize', height }

  import { onMount } from 'svelte';
  import { mount, unmount } from 'svelte';
  import '$lib/editor/preview/iframe-host.css';

  type IncomingMessage =
    | { type: 'compile'; source: string; frontmatter: Record<string, unknown> };

  onMount(() => {
    let instance: ReturnType<typeof mount> | null = null;
    const host = document.getElementById('mount');

    function tearDown() {
      if (instance) {
        try { unmount(instance); }
        catch (e) { console.error('[preview] unmount failed', e); }
        instance = null;
      }
      if (host) host.innerHTML = '';
    }

    function post(msg: Record<string, unknown>) {
      window.parent.postMessage(msg, '*');
    }

    let lastReportedHeight = -1;
    const HEIGHT_REPORT_TOLERANCE = 2;
    function reportHeight() {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastReportedHeight) <= HEIGHT_REPORT_TOLERANCE) return;
      lastReportedHeight = h;
      post({ type: 'preview-resize', height: h });
    }

    let runId = 0;
    let compilerPromise: Promise<
      typeof import('$lib/editor/preview/compile')
    > | null = null;
    function loadCompiler() {
      // Kept lazy so the 500KB svelte/compiler + mdsvex chunk only loads
      // when the preview route actually runs — and is ineligible for
      // inclusion in any site route's bundle.
      compilerPromise ??= import('$lib/editor/preview/compile');
      return compilerPromise;
    }

    async function handleCompile(source: string, frontmatter: Record<string, unknown>) {
      const myRun = ++runId;
      try {
        const { compileSvxToComponent } = await loadCompiler();
        const result = await compileSvxToComponent(source);
        if (myRun !== runId) return;
        if (!result.ok) {
          tearDown();
          post({ type: 'preview-error', message: result.error });
          return;
        }
        tearDown();
        if (!host) {
          post({ type: 'preview-error', message: 'preview host element missing' });
          return;
        }
        instance = mount(result.Component as never, {
          target: host,
          props: frontmatter,
        });
        post({ type: 'preview-rendered' });
        requestAnimationFrame(reportHeight);
      } catch (e) {
        const err = e as Error;
        post({ type: 'preview-error', message: err.stack ?? err.message ?? String(err) });
      }
    }

    function onMessage(ev: MessageEvent) {
      if (ev.source !== window.parent) return;
      const data = ev.data as IncomingMessage | undefined;
      if (!data || data.type !== 'compile') return;
      void handleCompile(data.source, data.frontmatter ?? {});
    }
    window.addEventListener('message', onMessage);

    const ro = new ResizeObserver(() => reportHeight());
    if (host) ro.observe(host);

    post({ type: 'preview-ready' });
    reportHeight();

    return () => {
      window.removeEventListener('message', onMessage);
      ro.disconnect();
      tearDown();
    };
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Huninn&display=swap"
  />
</svelte:head>

<div id="mount" class="content"></div>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    background: transparent;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }
  div#mount {
    padding: 24px 32px;
  }
  :global(.pv-error) {
    color: #b2462d;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    white-space: pre-wrap;
    padding: 16px;
    border-left: 3px solid #b2462d;
    background: rgba(178, 70, 45, 0.06);
  }
</style>
