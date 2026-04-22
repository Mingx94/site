<script lang="ts">
  import { tabs } from '$lib/editor/state/tabs.svelte';
  import { refreshTree } from '$lib/editor/state/workspace.svelte';
  import { postsStore, bumpCoverBust } from '$lib/editor/state/posts.svelte';
  import {
    uploadFileRel,
    assetUrlFor,
    deleteFileRel,
  } from '$lib/editor/io/fs-access';
  import { toJpegBlob } from '$lib/editor/image';
  import { Image as ImageIcon, Upload, Trash2 } from '@lucide/svelte';

  // Slug derived from the active tab path. Empty string when the active
  // file isn't a post article (e.g. user opened a non-post file somewhere).
  function deriveSlugFrom(path: string | null): string {
    if (!path?.startsWith('posts/')) return '';
    const segs = path.split('/');
    return segs.length >= 3 ? segs[1] : '';
  }

  const slug = $derived(deriveSlugFrom(tabs.active));
  const post = $derived(postsStore.list.find((p) => p.slug === slug));

  // Cache-buster: shared with PreviewPane so the article preview's
  // <img> tag refreshes in lockstep with this thumbnail. Module-level
  // (in posts.svelte.ts) so the value persists across remounts.
  let bust = $state(0);

  const coverUrl = $derived(
    post?.coverPath ? `${assetUrlFor(post.coverPath)}&v=${bust}` : null,
  );

  let busy = $state(false);
  let error = $state<string | null>(null);
  let inputEl: HTMLInputElement | null = $state(null);

  async function onPick(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !slug) return;
    busy = true;
    error = null;
    try {
      const jpeg = await toJpegBlob(file);
      await uploadFileRel(`posts/${slug}/cover.jpg`, jpeg);
      await refreshTree();
      bust++;
      if (slug) bumpCoverBust(slug);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
      input.value = '';
    }
  }

  async function removeCover() {
    if (!post?.coverPath) return;
    busy = true;
    error = null;
    try {
      await deleteFileRel(post.coverPath);
      await refreshTree();
      bust++;
      if (slug) bumpCoverBust(slug);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

{#if slug}
  <section class="cp">
    <div class="cp-head">
      <ImageIcon size={12} strokeWidth={1.8} />
      <span>封面</span>
    </div>

    <div class="cp-thumb">
      {#if coverUrl}
        <img src={coverUrl} alt="cover for {slug}" />
      {:else}
        <div class="cp-empty">
          <ImageIcon size={28} strokeWidth={1.2} />
          <span>尚無封面</span>
        </div>
      {/if}
    </div>

    <input
      bind:this={inputEl}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
      onchange={onPick}
      hidden
    />

    <div class="cp-actions">
      <button
        type="button"
        class="cp-btn cp-btn-primary"
        onclick={() => inputEl?.click()}
        disabled={busy}
      >
        <Upload size={12} strokeWidth={2} />
        {coverUrl ? '更換圖片…' : '選擇圖片…'}
      </button>
      {#if coverUrl}
        <button
          type="button"
          class="cp-btn cp-btn-danger"
          onclick={removeCover}
          disabled={busy}
          aria-label="移除封面"
        >
          <Trash2 size={12} strokeWidth={2} />
        </button>
      {/if}
    </div>

    {#if busy}
      <div class="cp-status">處理中…</div>
    {/if}
    {#if error}
      <div class="cp-error">{error}</div>
    {/if}

    <p class="cp-hint">
      支援 JPG / PNG / WebP / AVIF / GIF。所有上傳都會在瀏覽器轉成 JPEG 後存為
      <code>cover.jpg</code>。
    </p>
  </section>
{/if}

<style>
  .cp {
    margin: 0 0 14px;
    padding: 10px 12px 12px;
    background: var(--paper-card);
    border: 1px solid var(--line-hard);
    border-radius: 6px;
  }
  .cp-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--ink-fade);
    padding-bottom: 8px;
    border-bottom: 1px dashed var(--line);
    margin-bottom: 10px;
  }
  .cp-thumb {
    aspect-ratio: 3 / 2;
    background: var(--paper-2);
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cp-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .cp-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: var(--ink-ghost);
    font-family: var(--serif);
    font-size: 12px;
    font-style: italic;
  }
  .cp-actions {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }
  .cp-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border: 1px solid var(--line-hard);
    border-radius: 4px;
    background: var(--paper-card);
    color: var(--ink);
    cursor: pointer;
    font-family: var(--serif);
    font-size: 12px;
    box-shadow: 1px 1px 0 var(--ink-soft);
    transition: transform 0.08s ease;
  }
  .cp-btn:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: 2px 2px 0 var(--ink-soft);
  }
  .cp-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .cp-btn-primary {
    background: var(--ink);
    color: var(--paper-card);
    flex: 1;
    justify-content: center;
  }
  .cp-btn-danger {
    color: var(--accent);
    border-color: var(--accent);
  }
  .cp-btn-danger:hover:not(:disabled) {
    background: var(--accent);
    color: var(--paper-card);
  }
  .cp-status {
    margin-top: 8px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-fade);
  }
  .cp-error {
    margin-top: 8px;
    padding: 6px 10px;
    color: var(--accent);
    background: rgba(178, 70, 45, 0.08);
    border-left: 3px solid var(--accent);
    font-family: var(--mono);
    font-size: 11px;
  }
  .cp-hint {
    margin: 10px 0 0;
    font-family: var(--serif);
    font-size: 11px;
    color: var(--ink-fade);
    font-style: italic;
    line-height: 1.5;
  }
  .cp-hint code {
    font-family: var(--mono);
    font-size: 10.5px;
    background: var(--paper-2);
    padding: 0 4px;
    border-radius: 2px;
    color: var(--ink-soft);
    font-style: normal;
  }
</style>
