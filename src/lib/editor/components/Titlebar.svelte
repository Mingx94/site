<script lang="ts">
  import { workspace } from '$lib/editor/state/workspace.svelte';
  import { tabs, toggleRail } from '$lib/editor/state/tabs.svelte';
  import { files, dirtyCount } from '$lib/editor/state/files.svelte';
  import { togglePanel } from '$lib/editor/state/tweaks.svelte';
  import { toggleCmd } from '$lib/editor/state/ui.svelte';

  // Files state is read so the dirty-count derived re-evaluates when buffer
  // contents change.
  void files;

  const activePath = $derived(tabs.active);
  const modified = $derived(dirtyCount());
</script>

<div class="titlebar">
  <div class="tl-title">
    {#if workspace.rootName}
      <span class="tl-vault">{workspace.rootName}</span>
      {#if activePath}
        <span class="tl-sep">/</span>
        <span class="tl-path">{activePath}</span>
      {/if}
      {#if modified > 0}
        <span class="tl-modified">● {modified} modified</span>
      {/if}
    {:else}
      <span class="tl-vault">SVX Editor</span>
    {/if}
  </div>

  <div class="tl-right">
    {#if workspace.root}
      <button class="tl-icon" title="命令面板 Ctrl+K" onclick={toggleCmd}>⌘K</button>
      <button class="tl-icon" title="切換右欄 Ctrl+\" onclick={toggleRail}>
        {tabs.railOpen ? '▸│' : '│▸'}
      </button>
    {/if}
    <button class="tl-icon" title="Tweaks" onclick={togglePanel}>✎</button>
  </div>
</div>
