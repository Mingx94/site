// Entry point that runs *inside* the preview iframe (preview-host.html).
//
// The iframe loads with `sandbox="allow-scripts"` (but not
// `allow-same-origin`), so its document origin is opaque — it can execute
// JavaScript but cannot reach the parent's DOM, cookies, localStorage, or
// fetch same-origin APIs like `/__editor/*`. That's the point: a hostile
// `.svx` can't read the editor's dirty buffers or exfil data via the
// content API.
//
// Protocol: the parent posts `{type:'compile', source, frontmatter}`
// through `window.postMessage`; we compile, mount, and post back
// `{type:'preview-rendered'}` on success or `{type:'preview-error', message}`
// on failure. We also report layout height with `{type:'preview-resize',
// height}` so the parent can size the iframe to its content.

import { mount, unmount } from 'svelte';
import { compileSvxToComponent } from './compile';
// CSS surface for the iframe: tailwind + typography + site article.css,
// separate from the editor's app.css chrome. See iframe-host.css.
import './iframe-host.css';

let instance: ReturnType<typeof mount> | null = null;
const host = document.getElementById('mount');

function tearDown() {
  if (instance) {
    try {
      unmount(instance);
    } catch {
      /* noop */
    }
    instance = null;
  }
  if (host) host.innerHTML = '';
}

function post(msg: Record<string, unknown>) {
  window.parent.postMessage(msg, '*');
}

let lastReportedHeight = -1;
function reportHeight() {
  const h = document.documentElement.scrollHeight;
  if (h === lastReportedHeight) return;
  lastReportedHeight = h;
  post({ type: 'preview-resize', height: h });
}

type IncomingMessage =
  | { type: 'compile'; source: string; frontmatter: Record<string, unknown> };

// Simple run-id cancellation so an older compile can't overwrite a newer
// one if they finish out of order. Parent already debounces to 180ms.
let runId = 0;
async function handleCompile(source: string, frontmatter: Record<string, unknown>) {
  const myRun = ++runId;
  try {
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
    // Next frame so the freshly-mounted DOM has laid out.
    requestAnimationFrame(reportHeight);
  } catch (e) {
    const err = e as Error;
    post({ type: 'preview-error', message: err.stack ?? err.message ?? String(err) });
  }
}

window.addEventListener('message', (ev: MessageEvent) => {
  // Sandboxed iframes have origin 'null'; only accept messages from our
  // direct parent window. The parent's origin string isn't reliably
  // computable from inside the sandbox, so window identity is the guard.
  if (ev.source !== window.parent) return;
  const data = ev.data as IncomingMessage | undefined;
  if (!data || data.type !== 'compile') return;
  void handleCompile(data.source, data.frontmatter ?? {});
});

// Watch body for size changes (image loads, font swaps, late layout) and
// keep the parent in sync so the iframe never gets a scroll bar of its own.
const ro = new ResizeObserver(() => reportHeight());
ro.observe(document.documentElement);

// Tell the parent we're ready; it may have queued messages before load.
post({ type: 'preview-ready' });
reportHeight();
