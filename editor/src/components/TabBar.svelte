<script lang="ts">
  import { tabs, setActive, closeTab } from '$state/tabs.svelte';
  import { files, isDirty } from '$state/files.svelte';
</script>

<div class="tabs">
  {#if tabs.open.length === 0}
    <div class="tabs-empty">沒有開啟的檔案</div>
  {/if}
  {#each tabs.open as path (path)}
    {@const f = files.byPath[path]}
    {#if f}
      {@const active = tabs.active === path}
      {@const dirty = isDirty(path)}
      <div
        class="tab"
        class:active
        onclick={() => setActive(path)}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && setActive(path)}
      >
        <span class="tab-ico">✎</span>
        <span class="tab-name">{f.name}</span>
        {#if dirty}<span class="tab-dirty">●</span>{/if}
        <button
          class="tab-x"
          aria-label="Close tab"
          onclick={(e) => {
            e.stopPropagation();
            closeTab(path);
          }}>×</button
        >
      </div>
    {/if}
  {/each}
  <div class="tab-fill"></div>
</div>
