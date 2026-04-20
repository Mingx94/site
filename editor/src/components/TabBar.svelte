<script lang="ts">
  import { tabs, setActive, closeTab } from '$state/tabs.svelte';
  import { files, isDirty } from '$state/files.svelte';
  import { postLabelFor, slugFromArticlePath } from '$state/posts.svelte';
</script>

<div class="tabs">
  {#each tabs.open as path (path)}
    {@const f = files.byPath[path]}
    {#if f}
      {@const active = tabs.active === path}
      {@const dirty = isDirty(path)}
      {@const slug = slugFromArticlePath(path)}
      {@const label = postLabelFor(path)}
      <div
        class="tab"
        class:active
        title={slug ? `${label} (${slug})` : path}
        onclick={() => setActive(path)}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && setActive(path)}
      >
        <span class="tab-ico">✎</span>
        <span class="tab-name">{label}</span>
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
