<script lang="ts">
  import { mount, unmount } from 'svelte';
  import { compileSvxToComponent } from './compile';

  type Props = { source: string; frontmatter: Record<string, unknown> };
  const { source, frontmatter }: Props = $props();

  let host: HTMLDivElement | null = $state(null);
  let error = $state<string | null>(null);
  let instance: ReturnType<typeof mount> | null = null;
  let runId = 0;

  // Unmount the previous instance and clear host DOM. Pulled out so the
  // error path can call it too — previously a failed compile would leave the
  // last-valid instance mounted, its effects still running and orphaned from
  // our `instance` reference.
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

  async function render(src: string, fm: Record<string, unknown>) {
    const myRun = ++runId;
    const result = await compileSvxToComponent(src);
    if (myRun !== runId) return;
    if (!host) return;
    if (!result.ok) {
      tearDown();
      error = result.error;
      return;
    }
    tearDown();
    try {
      instance = mount(result.Component as never, {
        target: host,
        props: fm as Record<string, unknown>,
      });
      error = null;
    } catch (e) {
      error = (e as Error).stack ?? (e as Error).message ?? String(e);
    }
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    const src = source;
    const fm = frontmatter;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => render(src, fm), 180);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  });

  $effect(() => {
    return () => {
      if (instance) {
        try {
          unmount(instance);
        } catch {
          /* noop */
        }
        instance = null;
      }
    };
  });
</script>

<div bind:this={host}></div>
{#if error}
  <div class="pv-error">
    <strong>預覽失敗</strong>
    {error}
  </div>
{/if}
