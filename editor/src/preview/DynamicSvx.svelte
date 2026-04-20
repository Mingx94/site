<script lang="ts">
  import { mount, unmount } from 'svelte';
  import { compileSvxToComponent } from './compile';

  type Props = { source: string; frontmatter: Record<string, unknown> };
  const { source, frontmatter }: Props = $props();

  let host: HTMLDivElement | null = $state(null);
  let error = $state<string | null>(null);
  let instance: ReturnType<typeof mount> | null = null;
  let runId = 0;

  async function render(src: string, fm: Record<string, unknown>) {
    const myRun = ++runId;
    const result = await compileSvxToComponent(src);
    if (myRun !== runId) return;
    if (!host) return;
    if (!result.ok) {
      error = result.error;
      return;
    }
    if (instance) {
      try {
        unmount(instance);
      } catch {
        /* noop */
      }
      instance = null;
    }
    host.innerHTML = '';
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
