<script lang="ts">
  import { onMount, tick } from 'svelte';

  export type MenuItem =
    | { kind: 'sep' }
    | {
        kind: 'item';
        label: string;
        action: () => void | Promise<void>;
        shortcut?: string;
        danger?: boolean;
        disabled?: boolean;
      };

  type Props = {
    x: number;
    y: number;
    items: MenuItem[];
    onClose: () => void;
  };
  const { x, y, items, onClose }: Props = $props();

  let menuEl: HTMLDivElement | null = $state(null);
  let pos = $state({ left: 0, top: 0 });

  // Position once mounted: start at the requested coords, then clamp inside
  // the viewport so the menu never spills off-screen.
  onMount(async () => {
    pos = { left: x, top: y };
    await tick();
    if (!menuEl) return;
    const rect = menuEl.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - 8) {
      left = window.innerWidth - rect.width - 8;
    }
    if (top + rect.height > window.innerHeight - 8) {
      top = window.innerHeight - rect.height - 8;
    }
    pos = { left: Math.max(8, left), top: Math.max(8, top) };
    menuEl.focus();
  });

  function onItemClick(idx: number) {
    const it = items[idx];
    if (it.kind !== 'item' || it.disabled) return;
    Promise.resolve(it.action()).finally(onClose);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }
</script>

<svelte:window
  onclick={(ev) => {
    if (menuEl && !menuEl.contains(ev.target as Node)) onClose();
  }}
  oncontextmenu={(ev) => {
    if (menuEl && !menuEl.contains(ev.target as Node)) onClose();
  }}
/>

<div
  bind:this={menuEl}
  class="ctx-menu"
  style="left:{pos.left}px;top:{pos.top}px;"
  role="menu"
  tabindex="-1"
  onkeydown={onKey}
>
  {#each items as item, i (i)}
    {#if item.kind === 'sep'}
      <div class="ctx-sep" role="separator"></div>
    {:else}
      <button
        type="button"
        class="ctx-item"
        class:ctx-danger={item.danger}
        disabled={item.disabled}
        onclick={() => onItemClick(i)}
        role="menuitem"
      >
        <span class="ctx-label">{item.label}</span>
        {#if item.shortcut}
          <span class="ctx-shortcut">{item.shortcut}</span>
        {/if}
      </button>
    {/if}
  {/each}
</div>

<style>
  .ctx-menu {
    position: fixed;
    z-index: 200;
    min-width: 180px;
    background: var(--paper-card);
    border: 1px solid var(--ink);
    border-radius: 6px;
    box-shadow:
      2px 3px 0 var(--ink-soft),
      0 8px 24px rgba(0, 0, 0, 0.18);
    padding: 4px;
    outline: 0;
    font-family: var(--serif);
  }
  .ctx-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    width: 100%;
    padding: 6px 12px;
    background: transparent;
    border: 0;
    border-radius: 4px;
    cursor: pointer;
    color: var(--ink);
    font: inherit;
    font-size: 13px;
    text-align: left;
  }
  .ctx-item:hover:not(:disabled),
  .ctx-item:focus-visible:not(:disabled) {
    background: rgba(178, 70, 45, 0.08);
    color: var(--ink);
    outline: 0;
  }
  .ctx-item:disabled {
    color: var(--ink-ghost);
    cursor: not-allowed;
  }
  .ctx-danger {
    color: var(--accent);
  }
  .ctx-danger:hover:not(:disabled) {
    background: var(--accent);
    color: var(--paper-card);
  }
  .ctx-shortcut {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-fade);
  }
  .ctx-danger .ctx-shortcut {
    color: inherit;
    opacity: 0.85;
  }
  .ctx-sep {
    height: 1px;
    margin: 4px 6px;
    background: var(--line);
  }
</style>
