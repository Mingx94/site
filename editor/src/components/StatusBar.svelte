<script lang="ts">
  import { tabs } from '$state/tabs.svelte';
  import { files, dirtyCount, isDirty } from '$state/files.svelte';
  import { wordCount, readingTime } from '$lib/util';

  const activeFile = $derived(tabs.active ? files.byPath[tabs.active] : null);
  const wc = $derived(wordCount(activeFile?.content ?? ''));
  const rm = $derived(readingTime(wc));
  const dirty = $derived(dirtyCount());
  const activeDirty = $derived(tabs.active ? isDirty(tabs.active) : false);
</script>

<div class="statusbar">
  {#if dirty > 0}
    <span class="sb-dirty">● {dirty} unsaved</span>
  {:else}
    <span class="sb-saved">✓ saved</span>
  {/if}
  {#if activeDirty}<span class="sb-dirty">●</span>{/if}
  <span>mdsvex</span>
  <span>UTF-8</span>
  <span class="sb-spacer"></span>
  <span>{wc.toLocaleString()} 字 · {rm} min read</span>
  <span>預覽：{tabs.previewMode}</span>
</div>
