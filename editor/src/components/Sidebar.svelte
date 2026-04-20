<script lang="ts">
  import PostList from './PostList.svelte';
  import { workspace, refreshTree } from '$state/workspace.svelte';
  import { postsStore, createPost } from '$state/posts.svelte';
  import { openTab } from '$state/tabs.svelte';
  import { Search, X, RotateCw, Plus } from '@lucide/svelte';

  let search = $state('');
  let creating = $state(false);
  let createError = $state<string | null>(null);

  async function newPost() {
    if (creating) return;
    // Suggest a unique untitled-N slug.
    const taken = new Set(postsStore.list.map((p) => p.slug));
    let n = 1;
    while (taken.has(`untitled-${n}`)) n++;
    const initial = `untitled-${n}`;
    const slug = window.prompt('新文章 slug（小寫英數字 + 連字號）', initial);
    if (slug === null) return;
    creating = true;
    createError = null;
    try {
      const articlePath = await createPost(slug);
      await openTab(articlePath);
    } catch (e) {
      createError = (e as Error).message;
    } finally {
      creating = false;
    }
  }
</script>

<aside class="sidebar">
  <div class="sb-search">
    <span class="sb-search-ico">
      <Search size={14} strokeWidth={1.8} />
    </span>
    <input placeholder="搜尋文章…" bind:value={search} />
    {#if search}
      <button onclick={() => (search = '')} aria-label="清除搜尋">
        <X size={14} strokeWidth={1.8} />
      </button>
    {/if}
  </div>
  <div class="sb-section">
    <span>POSTS</span>
    <div class="sb-actions">
      <button
        class="sb-mini"
        title="新增文章"
        onclick={newPost}
        aria-label="新增文章"
        disabled={creating}
      >
        <Plus size={12} strokeWidth={1.8} />
      </button>
      <button
        class="sb-mini"
        title="重新整理"
        onclick={() => refreshTree()}
        aria-label="重新整理"
      >
        <RotateCw size={12} strokeWidth={1.8} />
      </button>
    </div>
  </div>
  {#if createError}
    <div class="sb-error">{createError}</div>
  {/if}
  <div class="sb-tree">
    {#if workspace.error}
      <div class="sb-empty">無法載入工作區：{workspace.error}</div>
    {:else if workspace.loading && workspace.tree.length === 0}
      <div class="sb-empty">載入中…</div>
    {:else}
      <PostList {search} />
    {/if}
  </div>
</aside>

<style>
  .sb-error {
    margin: 4px 8px;
    padding: 4px 8px;
    color: var(--accent);
    background: rgba(178, 70, 45, 0.08);
    border-left: 3px solid var(--accent);
    font-family: var(--mono);
    font-size: 11px;
  }
  .sb-empty {
    padding: 8px;
    color: var(--ink-fade);
    font-style: italic;
    font-size: 12.5px;
  }
</style>
