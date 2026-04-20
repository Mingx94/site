<script lang="ts">
  import PostList from './PostList.svelte';
  import PromptDialog from './PromptDialog.svelte';
  import { workspace, refreshTree } from '$state/workspace.svelte';
  import { postsStore, createPost, isValidSlug } from '$state/posts.svelte';
  import { openTab } from '$state/tabs.svelte';
  import { Search, X, RotateCw, Plus } from '@lucide/svelte';

  let search = $state('');
  let promptOpen = $state(false);
  let promptDefault = $state('untitled-1');
  let createError = $state<string | null>(null);

  function openNewPostDialog() {
    // Suggest a unique untitled-N slug.
    const taken = new Set(postsStore.list.map((p) => p.slug));
    let n = 1;
    while (taken.has(`untitled-${n}`)) n++;
    promptDefault = `untitled-${n}`;
    createError = null;
    promptOpen = true;
  }

  // Live validator for the prompt input — same rules as createPost so the
  // user sees errors before submitting.
  function validateSlug(slug: string): string | null {
    if (!slug.trim()) return null; // empty is "neutral" — submit disabled separately
    if (!isValidSlug(slug.trim())) {
      return 'slug 只能用小寫英文、數字、連字號，且不能以連字號開頭';
    }
    if (postsStore.list.some((p) => p.slug === slug.trim())) {
      return `slug 「${slug.trim()}」 已存在`;
    }
    return null;
  }

  async function confirmNewPost(slug: string) {
    const articlePath = await createPost(slug);
    promptOpen = false;
    await openTab(articlePath);
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
        onclick={openNewPostDialog}
        aria-label="新增文章"
        disabled={promptOpen}
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

{#if promptOpen}
  <PromptDialog
    title="新增文章"
    message="輸入 slug — 會建立 posts/<slug>/article.svx 並開啟編輯器。"
    defaultValue={promptDefault}
    placeholder="my-new-post"
    confirmLabel="建立"
    validate={validateSlug}
    onConfirm={confirmNewPost}
    onCancel={() => (promptOpen = false)}
  />
{/if}

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
