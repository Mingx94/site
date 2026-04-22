<script lang="ts">
  import { onMount } from 'svelte';
  import '@/styles/global.css';
  import '$lib/editor/paper-theme.css';
  import Titlebar from '$lib/editor/components/Titlebar.svelte';
  import Sidebar from '$lib/editor/components/Sidebar.svelte';
  import TabBar from '$lib/editor/components/TabBar.svelte';
  import Toolbar from '$lib/editor/components/Toolbar.svelte';
  import EditorPane from '$lib/editor/components/EditorPane.svelte';
  import PreviewPane from '$lib/editor/components/PreviewPane.svelte';
  import Rail from '$lib/editor/components/Rail.svelte';
  import StatusBar from '$lib/editor/components/StatusBar.svelte';
  import CommandPalette from '$lib/editor/components/CommandPalette.svelte';
  import TweaksPanel from '$lib/editor/components/TweaksPanel.svelte';
  import ConfirmDialog from '$lib/editor/components/ConfirmDialog.svelte';

  import {
    workspace,
    loadWorkspace,
    refreshTree,
  } from '$lib/editor/state/workspace.svelte';
  import {
    tabs,
    closeTab,
    toggleRail,
    openTab,
  } from '$lib/editor/state/tabs.svelte';
  import {
    saveFile,
    dirtyCount,
    files,
    isDirty,
    reloadFromDisk,
    restoreDirtySnapshots,
    SaveConflictError,
  } from '$lib/editor/state/files.svelte';
  import { loadTweaks, togglePanel, tweaks } from '$lib/editor/state/tweaks.svelte';
  import { ui, toggleCmd, closeCmd } from '$lib/editor/state/ui.svelte';
  import {
    slugFromArticlePath,
    invalidatePostMeta,
    loadPostMeta,
  } from '$lib/editor/state/posts.svelte';
  import { startRename, edits } from '$lib/editor/state/edits.svelte';

  type FsEvent = {
    type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
    path: string;
  };

  // Save-conflict dialog state. When another editor touched a file we're
  // about to save, the server rejects the PUT (ETag mismatch) and we
  // surface a confirm dialog offering overwrite or reload.
  let conflict = $state<{ path: string } | null>(null);

  async function saveActive(path: string) {
    try {
      await saveFile(path);
    } catch (e) {
      if (e instanceof SaveConflictError) {
        conflict = { path: e.path };
      } else {
        console.error('[editor] save failed:', e);
      }
    }
  }

  async function overwriteConflict() {
    if (!conflict) return;
    const path = conflict.path;
    conflict = null;
    try {
      await saveFile(path, true);
    } catch (e) {
      console.error('[editor] overwrite failed:', e);
    }
  }

  async function reloadConflict() {
    if (!conflict) return;
    const path = conflict.path;
    conflict = null;
    try {
      await reloadFromDisk(path);
    } catch (e) {
      console.error('[editor] reload failed:', e);
    }
  }

  function isEditableTarget(ev: KeyboardEvent): boolean {
    const t = ev.target as HTMLElement | null;
    if (!t) return false;
    const tag = t.tagName;
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      t.isContentEditable
    );
  }

  let pendingTreeRefresh: ReturnType<typeof setTimeout> | null = null;
  function scheduleTreeRefresh() {
    if (pendingTreeRefresh) return;
    pendingTreeRefresh = setTimeout(() => {
      pendingTreeRefresh = null;
      refreshTree();
    }, 150);
  }

  async function handleFsEvent(e: FsEvent) {
    if (e.type === 'change') {
      const f = files.byPath[e.path];
      if (f && !isDirty(e.path)) {
        try { await reloadFromDisk(e.path); } catch { /* ignore */ }
      }
      if (e.path.endsWith('/article.svx')) {
        invalidatePostMeta(e.path);
        loadPostMeta(e.path, true);
      }
    } else {
      scheduleTreeRefresh();
    }
  }

  onMount(() => {
    const keyHandler = async (ev: KeyboardEvent) => {
      const mod = ev.metaKey || ev.ctrlKey;
      if (mod && ev.key.toLowerCase() === 'k') {
        ev.preventDefault();
        toggleCmd();
      } else if (mod && ev.key.toLowerCase() === 's') {
        ev.preventDefault();
        if (tabs.active) await saveActive(tabs.active);
      } else if (mod && ev.key.toLowerCase() === 'w') {
        ev.preventDefault();
        if (tabs.active) closeTab(tabs.active);
      } else if (mod && ev.key === '\\') {
        ev.preventDefault();
        toggleRail();
      } else if (ev.key === 'F2' && !edits.renaming && !isEditableTarget(ev)) {
        const slug = slugFromArticlePath(tabs.active);
        if (slug) {
          ev.preventDefault();
          startRename(slug);
        }
      } else if (ev.key === 'Escape') {
        if (ui.cmdOpen) closeCmd();
        else if (tweaks.panelOpen) togglePanel();
      }
    };
    window.addEventListener('keydown', keyHandler);

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyCount() > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    let offFs: (() => void) | null = null;
    if (import.meta.hot) {
      const handler = (data: FsEvent) => handleFsEvent(data);
      import.meta.hot.on('editor:fs', handler);
      offFs = () => import.meta.hot?.off('editor:fs', handler);
    }

    (async () => {
      await loadTweaks();
      await loadWorkspace();
      const restored = restoreDirtySnapshots();
      for (const p of restored) {
        try {
          await openTab(p);
        } catch {
          /* file may have been deleted externally — skip silently */
        }
      }
    })();

    return () => {
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('beforeunload', onBeforeUnload);
      offFs?.();
    };
  });
</script>

<div class="app">
  <Titlebar />

  <div
    class="body"
    class:rail-hidden={!tabs.railOpen}
    class:edit={tabs.previewMode === 'edit'}
    class:preview={tabs.previewMode === 'preview'}
  >
    <Sidebar />
    <main class="main">
      <TabBar />
      <Toolbar />
      <div class="panes">
        {#if workspace.error}
          <div class="ed-empty ed-error">
            <strong>無法載入工作區</strong>
            <pre>{workspace.error}</pre>
            <button onclick={() => loadWorkspace()}>重試</button>
          </div>
        {:else if tabs.active && tabs.previewMode !== 'preview'}
          <EditorPane />
        {/if}
        {#if !workspace.error && tabs.active && tabs.previewMode !== 'edit'}
          <PreviewPane />
        {/if}
        {#if !workspace.error && !tabs.active}
          <div class="ed-empty">
            {workspace.loading
              ? '載入工作區中…'
              : '從左側選一篇文章開始編輯'}
          </div>
        {/if}
      </div>
      <StatusBar />
    </main>
    {#if tabs.railOpen}
      <Rail />
    {/if}
  </div>

  {#if ui.cmdOpen}
    <CommandPalette onClose={closeCmd} />
  {/if}

  {#if tweaks.panelOpen}
    <TweaksPanel />
  {/if}

  {#if conflict}
    <ConfirmDialog
      title="外部編輯衝突"
      message="檔案在其他編輯器被改過了。要以你目前的內容覆蓋，還是捨棄本機修改改用 disk 版本？"
      confirmLabel="覆蓋 disk"
      cancelLabel="重新載入 disk"
      danger
      onConfirm={overwriteConflict}
      onCancel={reloadConflict}
    />
  {/if}
</div>

<style>
  .ed-error {
    text-align: left;
    color: var(--accent);
    font-family: var(--mono);
    font-size: 12.5px;
    padding: 32px;
    max-width: 600px;
    margin: 0 auto;
  }
  .ed-error strong {
    display: block;
    font-family: var(--hand);
    font-size: 18px;
    margin-bottom: 8px;
  }
  .ed-error pre {
    white-space: pre-wrap;
    margin: 8px 0 16px;
    padding: 12px;
    background: rgba(178, 70, 45, 0.06);
    border-left: 3px solid var(--accent);
  }
  .ed-error button {
    background: var(--ink);
    color: var(--paper-card);
    border: 0;
    border-radius: 4px;
    padding: 6px 14px;
    font-family: var(--serif);
    font-size: 13px;
    cursor: pointer;
  }
</style>
