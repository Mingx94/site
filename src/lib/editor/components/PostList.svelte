<script lang="ts">
  import { tick } from 'svelte';
  import { tabs, openTab } from '$lib/editor/state/tabs.svelte';
  import { files } from '$lib/editor/state/files.svelte';
  import {
    postsStore,
    postMeta,
    loadPostMeta,
    invalidatePostMeta,
    renamePost,
    deletePost,
    isValidSlug,
    type PostSummary,
  } from '$lib/editor/state/posts.svelte';
  import {
    edits,
    startRename,
    cancelEdit,
    setEditError,
  } from '$lib/editor/state/edits.svelte';
  import ContextMenu, { type MenuItem } from './ContextMenu.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import { NotebookPen, Image as ImageIcon } from '@lucide/svelte';

  type Props = { search: string };
  const { search }: Props = $props();

  const lowerSearch = $derived(search.trim().toLowerCase());

  const visiblePosts = $derived.by(() => {
    const list = postsStore.list;
    if (!lowerSearch) return list;
    return list.filter((p) => {
      if (p.slug.toLowerCase().includes(lowerSearch)) return true;
      const title = postMeta[p.articlePath]?.title?.toLowerCase() ?? '';
      return title.includes(lowerSearch);
    });
  });

  // Lazily load each visible post's frontmatter so we can show titles
  // instead of slugs. Cache stays warm until invalidated by save / rename.
  $effect(() => {
    for (const p of visiblePosts) loadPostMeta(p.articlePath);
  });

  // Keep the cached metadata fresh when the user saves the active article
  // — the on-disk frontmatter just changed.
  $effect(() => {
    const path = tabs.active;
    if (!path?.endsWith('article.svx')) return;
    const f = files.byPath[path];
    if (!f) return;
    void f.diskContent; // depend on diskContent so this re-runs after save
    invalidatePostMeta(path);
    loadPostMeta(path, true);
  });

  function titleFor(p: PostSummary): string {
    return postMeta[p.articlePath]?.title || p.slug;
  }

  function isDraft(p: PostSummary): boolean {
    return postMeta[p.articlePath]?.draft === true;
  }

  // ---------- focus / keyboard ----------

  let focused = $state<string | null>(null);
  const activeFocus = $derived<string | null>(
    visiblePosts.length === 0
      ? null
      : focused && visiblePosts.some((p) => p.slug === focused)
        ? focused
        : (visiblePosts[0]?.slug ?? null),
  );

  async function focusSlug(slug: string) {
    focused = slug;
    await tick();
    document
      .querySelector<HTMLElement>(`[data-pl-slug="${CSS.escape(slug)}"]`)
      ?.focus();
  }

  async function onKey(e: KeyboardEvent) {
    if (edits.renaming) return;
    if (visiblePosts.length === 0) return;
    const idx = visiblePosts.findIndex((p) => p.slug === activeFocus);
    if (idx < 0) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = visiblePosts[Math.min(visiblePosts.length - 1, idx + 1)];
        if (next) await focusSlug(next.slug);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = visiblePosts[Math.max(0, idx - 1)];
        if (prev) await focusSlug(prev.slug);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        await openTab(visiblePosts[idx].articlePath);
        break;
      }
      case 'F2': {
        e.preventDefault();
        startRename(visiblePosts[idx].slug);
        break;
      }
      case 'Delete':
      case 'Backspace': {
        e.preventDefault();
        askDelete(visiblePosts[idx]);
        break;
      }
    }
  }

  // ---------- context menu ----------

  let menu = $state<{ x: number; y: number; post: PostSummary } | null>(null);

  function openMenu(ev: MouseEvent, p: PostSummary) {
    ev.preventDefault();
    focused = p.slug;
    menu = { x: ev.clientX, y: ev.clientY, post: p };
  }

  function closeMenu() {
    menu = null;
  }

  function buildMenuItems(p: PostSummary): MenuItem[] {
    return [
      { kind: 'item', label: '開啟', action: () => openTab(p.articlePath) },
      { kind: 'sep' },
      {
        kind: 'item',
        label: '重新命名 slug',
        shortcut: 'F2',
        action: () => startRename(p.slug),
      },
      {
        kind: 'item',
        label: '刪除文章',
        shortcut: 'Del',
        danger: true,
        action: () => askDelete(p),
      },
      { kind: 'sep' },
      {
        kind: 'item',
        label: '複製 slug',
        action: () => navigator.clipboard?.writeText(p.slug),
      },
    ];
  }

  // ---------- inline slug rename ----------

  let inputEl: HTMLInputElement | null = $state(null);
  let inputValue = $state('');

  $effect(() => {
    if (edits.renaming) inputValue = edits.renaming;
  });

  $effect(() => {
    if (!inputEl || !edits.renaming) return;
    inputEl.focus();
    inputEl.select();
  });

  async function commitRename() {
    setEditError(null);
    const oldSlug = edits.renaming;
    if (!oldSlug) return;
    const newSlug = inputValue.trim();
    if (!newSlug || newSlug === oldSlug) {
      cancelEdit();
      return;
    }
    if (!isValidSlug(newSlug)) {
      setEditError('slug 只能用小寫英文、數字、連字號');
      return;
    }
    try {
      await renamePost(oldSlug, newSlug);
      cancelEdit();
      focused = newSlug;
    } catch (e) {
      setEditError((e as Error).message);
    }
  }

  function onInputKey(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }

  // ---------- delete ----------

  let pendingDelete = $state<PostSummary | null>(null);

  function askDelete(p: PostSummary) {
    pendingDelete = p;
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const p = pendingDelete;
    try {
      await deletePost(p.slug);
    } finally {
      pendingDelete = null;
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<ul
  class="pl"
  role="listbox"
  aria-label="Posts"
  tabindex="-1"
  onkeydown={onKey}
>
  {#each visiblePosts as post (post.slug)}
    {@const isActive = tabs.active === post.articlePath}
    {@const dirty =
      files.byPath[post.articlePath] &&
      files.byPath[post.articlePath].content !==
        files.byPath[post.articlePath].diskContent}
    {@const renamingThis = edits.renaming === post.slug}
    <li
      role="option"
      aria-selected={isActive}
      data-pl-slug={post.slug}
      tabindex={activeFocus === post.slug ? 0 : -1}
      class="pl-row"
      class:active={isActive}
      class:pl-renaming={renamingThis}
      onclick={() => {
        if (renamingThis) return;
        focused = post.slug;
        openTab(post.articlePath);
      }}
      onfocus={() => (focused = post.slug)}
      oncontextmenu={(ev) => openMenu(ev, post)}
    >
      <span class="pl-ico" aria-hidden="true">
        {#if post.coverPath}
          <ImageIcon size={14} strokeWidth={1.6} />
        {:else}
          <NotebookPen size={14} strokeWidth={1.6} />
        {/if}
      </span>
      <div class="pl-body">
        {#if renamingThis}
          <input
            bind:this={inputEl}
            bind:value={inputValue}
            class="pl-input"
            spellcheck="false"
            autocomplete="off"
            onkeydown={onInputKey}
            onblur={commitRename}
            onclick={(e) => e.stopPropagation()}
          />
        {:else}
          <span class="pl-title">{titleFor(post)}</span>
          <span class="pl-slug">{post.slug}</span>
        {/if}
      </div>
      {#if dirty}
        <span class="pl-dirty" aria-label="未儲存">●</span>
      {/if}
      {#if isDraft(post) && !renamingThis}
        <span class="pl-draft">DRAFT</span>
      {/if}
    </li>
  {:else}
    <li class="pl-empty">
      {lowerSearch ? `沒有符合「${search}」的文章` : '尚無文章'}
    </li>
  {/each}
  {#if edits.error}
    <li class="pl-error">{edits.error}</li>
  {/if}
</ul>

{#if menu}
  <ContextMenu
    x={menu.x}
    y={menu.y}
    items={buildMenuItems(menu.post)}
    onClose={closeMenu}
  />
{/if}

{#if pendingDelete}
  <ConfirmDialog
    title="刪除文章"
    message="確定要刪除 「{titleFor(pendingDelete)}」（slug: {pendingDelete.slug}）？整個 posts/{pendingDelete.slug}/ 資料夾與其中的檔案都會被刪除，無法復原。"
    confirmLabel="刪除"
    cancelLabel="取消"
    danger
    onConfirm={confirmDelete}
    onCancel={() => (pendingDelete = null)}
  />
{/if}

<style>
  .pl {
    list-style: none;
    padding: 4px 0;
    margin: 0;
    font-family: var(--serif);
    font-size: 13px;
    outline: 0;
  }
  .pl-row {
    display: grid;
    grid-template-columns: 18px 1fr auto auto;
    gap: 8px;
    align-items: center;
    padding: 6px 10px 6px 8px;
    cursor: pointer;
    color: var(--ink);
    border-radius: 4px;
    margin: 0 4px;
  }
  .pl-row:hover,
  .pl-row:focus-visible {
    background: rgba(178, 70, 45, 0.06);
    outline: 0;
  }
  .pl-row.active {
    background: rgba(58, 107, 82, 0.1);
    color: var(--ink);
  }
  .pl-renaming {
    background: rgba(178, 70, 45, 0.04);
  }
  .pl-ico {
    color: var(--ink-fade);
    display: inline-flex;
  }
  .pl-row.active .pl-ico {
    color: var(--accent-2);
  }
  .pl-body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .pl-title {
    font-family: var(--serif);
    font-size: 13.5px;
    font-weight: 500;
    color: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pl-slug {
    font-family: var(--mono);
    font-size: 10.5px;
    color: var(--ink-fade);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pl-input {
    flex: 1;
    padding: 1px 6px;
    background: var(--paper-card);
    border: 1px solid var(--accent);
    border-radius: 3px;
    font-family: var(--mono);
    font-size: 12.5px;
    color: var(--ink);
    outline: 0;
    min-width: 0;
  }
  .pl-dirty {
    color: var(--accent);
    font-size: 10px;
    line-height: 1;
  }
  .pl-draft {
    background: var(--accent);
    color: var(--paper-card);
    font-family: var(--mono);
    font-size: 9px;
    padding: 1px 5px;
    border-radius: 3px;
    letter-spacing: 1px;
  }
  .pl-empty {
    padding: 16px 12px;
    color: var(--ink-fade);
    font-style: italic;
    font-size: 12px;
    text-align: center;
  }
  .pl-error {
    margin: 4px 8px;
    padding: 4px 8px;
    color: var(--accent);
    background: rgba(178, 70, 45, 0.08);
    border-left: 3px solid var(--accent);
    font-family: var(--mono);
    font-size: 11px;
  }
</style>
