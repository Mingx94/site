<script lang="ts">
  import { workspace } from '$state/workspace.svelte';
  import { openTab } from '$state/tabs.svelte';
  import {
    postLabelFor,
    slugFromArticlePath,
    ensurePostMeta,
  } from '$state/posts.svelte';
  import type { TreeNode } from '$lib/io/fs-access';

  type Props = { onClose: () => void };
  const { onClose }: Props = $props();

  const EDIT_EXT = new Set(['svx', 'md', 'mdx', 'txt', 'json', 'yaml', 'yml']);

  type Item = { path: string; label: string; rel: string };

  const allFiles = $derived.by(() => {
    const out: Item[] = [];
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (n.type === 'dir') walk(n.children);
        else if (EDIT_EXT.has(n.ext)) {
          // For post articles, the display label is the title (or slug);
          // for any other file, fall back to the file name. This keeps
          // the palette useful — every post otherwise has the literal
          // name "article.svx".
          const slug = slugFromArticlePath(n.path);
          out.push({
            path: n.path,
            label: slug ? postLabelFor(n.path) : n.name,
            rel: n.path,
          });
        }
      }
    };
    walk(workspace.tree);
    return out;
  });

  let q = $state('');
  let index = $state(0);

  const filtered = $derived.by(() => {
    const lower = q.toLowerCase();
    const list = !lower
      ? allFiles
      : allFiles.filter(
          (f) =>
            f.label.toLowerCase().includes(lower) ||
            f.rel.toLowerCase().includes(lower),
        );
    return list.slice(0, 12);
  });

  async function choose(item: Item) {
    await openTab(item.path);
    onClose();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      index = Math.min(filtered.length - 1, index + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      index = Math.max(0, index - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = filtered[index];
      if (pick) choose(pick);
    }
  }

  $effect(() => {
    void q;
    index = 0;
  });

  // Warm the frontmatter cache for the currently visible subset so the
  // label helper has something to read. Runs outside the derived render
  // pass to keep $state mutations off the hot path.
  $effect(() => {
    for (const item of filtered) ensurePostMeta(item.path);
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="cmd-overlay" onclick={onClose}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="cmd-box" onclick={(e) => e.stopPropagation()}>
    <!-- svelte-ignore a11y_autofocus -->
    <input
      autofocus
      placeholder="輸入指令或檔名…  ⌘K"
      bind:value={q}
      onkeydown={onKey}
    />
    <div class="cmd-list">
      {#each filtered as item, i (item.path)}
        <div
          class="cmd-item"
          class:active={i === index}
          onclick={() => choose(item)}
          onmouseenter={() => (index = i)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && choose(item)}
        >
          <span class="cmd-ico">✎</span>
          <span class="cmd-name">{item.label}</span>
          <span class="cmd-title">{item.rel}</span>
        </div>
      {/each}
      {#if filtered.length === 0}
        <div class="cmd-empty">沒有符合的檔案</div>
      {/if}
    </div>
    <div class="cmd-hint">
      <span>↑↓ 選擇</span>
      <span>↵ 開啟</span>
      <span>esc 關閉</span>
    </div>
  </div>
</div>
