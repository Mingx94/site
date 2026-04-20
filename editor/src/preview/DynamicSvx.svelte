<script lang="ts">
  // Hosts the rendered .svx body inside a sandboxed iframe. The iframe
  // loads `/preview-host.html` (a separate Vite entry) with sandbox flags
  // that forbid same-origin access — so the compiled .svx code runs with
  // an opaque document origin and cannot reach the editor's DOM, storage,
  // or the dev content API at `/__editor/*`.
  //
  // Protocol with iframe-entry.ts:
  //   parent → iframe: { type: 'compile', source, frontmatter }
  //   iframe → parent: { type: 'preview-ready' } once on load
  //   iframe → parent: { type: 'preview-rendered' } on successful mount
  //   iframe → parent: { type: 'preview-error', message } on compile/mount failure

  type Props = { source: string; frontmatter: Record<string, unknown> };
  const { source, frontmatter }: Props = $props();

  let iframeEl: HTMLIFrameElement | null = $state(null);
  let error = $state<string | null>(null);
  let ready = $state(false);
  let contentHeight = $state(600);
  let pending: { source: string; frontmatter: Record<string, unknown> } | null = null;

  function sendCompile(src: string, fm: Record<string, unknown>) {
    const win = iframeEl?.contentWindow;
    if (!win) return;
    win.postMessage({ type: 'compile', source: src, frontmatter: fm }, '*');
  }

  function onMessage(ev: MessageEvent) {
    // Only trust messages coming from our own iframe window. targetOrigin
    // on the other side is '*' because sandboxed iframes have null origin;
    // window identity is the only reliable guard.
    if (!iframeEl || ev.source !== iframeEl.contentWindow) return;
    const data = ev.data as
      | { type: 'preview-ready' }
      | { type: 'preview-rendered' }
      | { type: 'preview-error'; message: string }
      | { type: 'preview-resize'; height: number };
    if (!data) return;
    if (data.type === 'preview-ready') {
      ready = true;
      if (pending) {
        sendCompile(pending.source, pending.frontmatter);
        pending = null;
      }
    } else if (data.type === 'preview-rendered') {
      error = null;
    } else if (data.type === 'preview-error') {
      error = data.message;
    } else if (data.type === 'preview-resize') {
      // Cap absurd heights — a runaway content bug could otherwise blow
      // up the scroll container. 20k px covers even very long articles.
      contentHeight = Math.min(20000, Math.max(200, data.height));
    }
  }

  $effect(() => {
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  });

  // Debounced push of source changes into the iframe. Same 180ms window
  // the non-sandboxed renderer used, so typing feels the same.
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    const src = source;
    const fm = frontmatter;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (ready) sendCompile(src, fm);
      else pending = { source: src, frontmatter: fm };
    }, 180);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  });
</script>

<!--
  sandbox="allow-scripts":
    - scripts run (required; we're executing compiled Svelte)
    - no allow-same-origin → document.origin is null, cross-origin to parent
    - no allow-forms / allow-popups / allow-top-navigation → can't escape
  The dev server serves /preview-host via Vite's static HTML handling;
  production serves it from the dist bundle (configured in vite.config.ts).
-->
<iframe
  bind:this={iframeEl}
  src="/preview-host.html"
  title="preview"
  sandbox="allow-scripts"
  class="preview-iframe"
  style:height="{contentHeight}px"
></iframe>
{#if error}
  <div class="pv-error">
    <strong>預覽失敗</strong>
    {error}
  </div>
{/if}

<style>
  .preview-iframe {
    width: 100%;
    border: 0;
    background: transparent;
    display: block;
  }
</style>
