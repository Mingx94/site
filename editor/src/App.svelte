<script lang="ts">
  import { onMount } from 'svelte';
  import Titlebar from './components/Titlebar.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import TabBar from './components/TabBar.svelte';
  import Toolbar from './components/Toolbar.svelte';
  import EditorPane from './components/EditorPane.svelte';
  import PreviewPane from './components/PreviewPane.svelte';
  import Rail from './components/Rail.svelte';
  import StatusBar from './components/StatusBar.svelte';
  import CommandPalette from './components/CommandPalette.svelte';
  import TweaksPanel from './components/TweaksPanel.svelte';

  import { workspace, loadWorkspace, refreshTree } from '$state/workspace.svelte';
  import { tabs, closeTab, toggleRail, openTab } from '$state/tabs.svelte';
  import {
    saveFile,
    dirtyCount,
    files,
    isDirty,
    reloadFromDisk,
    restoreDirtySnapshots,
    SaveConflictError,
  } from '$state/files.svelte';
  import ConfirmDialog from './components/ConfirmDialog.svelte';
  import { loadTweaks, togglePanel, tweaks } from '$state/tweaks.svelte';
  import { ui, toggleCmd, closeCmd } from '$state/ui.svelte';
  import {
    slugFromArticlePath,
    invalidatePostMeta,
    loadPostMeta,
  } from '$state/posts.svelte';
  import { startRename, edits } from '$state/edits.svelte';

  type FsEvent = {
    type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
    path: string;
  };

  // Save-conflict dialog state. When another editor touched a file we're
  // about to save, the server rejects the PUT (ETag mismatch) and we
  // surface a confirm dialog offering overwrite or reload.
  let conflict = $state<{ path: string } | null>(null);

  // Wrapper around saveFile that surfaces SaveConflictError through a
  // dialog instead of letting it bubble up as a console error. Used by
  // Ctrl+S and any UI entry point that saves the active buffer.
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

  // Returns true when focus is in an editable element — used to suppress
  // non-modifier shortcuts (F2) that would otherwise eat normal typing.
  // Mod-prefixed shortcuts (Ctrl/⌘+K/S/W/\) intentionally fire everywhere.
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

  // Coalesce bursts of chokidar events (e.g. an editor saving via temp+rename
  // emits unlink+add in quick succession) so we don't refreshTree twice.
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
      // File rewritten externally — refresh in-memory buffer if we have it
      // open AND the user hasn't started editing locally. Dirty buffers
      // win to avoid clobbering unsaved work.
      const f = files.byPath[e.path];
      if (f && !isDirty(e.path)) {
        try { await reloadFromDisk(e.path); } catch { /* ignore */ }
      }
      // Refresh cached post metadata so the sidebar title stays current.
      if (e.path.endsWith('/article.svx')) {
        invalidatePostMeta(e.path);
        loadPostMeta(e.path, true);
      }
    } else {
      // Something appeared / disappeared — tree shape changed.
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
        // Rename the currently active post from anywhere — matches the
        // hint shown in PostList's right-click menu so the shortcut isn't
        // tied to focus being inside the sidebar listbox. But skip when
        // the user is typing inside an input (PromptDialog, search, etc.)
        // so F2 in those fields types a normal character.
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

    // Browser-native unsaved warning — Chrome shows its standard
    // "Leave site?" dialog when returnValue is set.
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyCount() > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    // Subscribe to out-of-band filesystem events from the dev server.
    // Only available in `vite dev` (production builds have no HMR client).
    let offFs: (() => void) | null = null;
    if (import.meta.hot) {
      const handler = (data: FsEvent) => handleFsEvent(data);
      import.meta.hot.on('editor:fs', handler);
      offFs = () => import.meta.hot?.off('editor:fs', handler);
    }

    (async () => {
      await loadTweaks();
      await loadWorkspace();
      // After the workspace is ready, rehydrate any dirty buffers that were
      // left in localStorage from a previous session and re-open their tabs.
      // Each `openTab` call triggers `loadFile` which reconciles the buffer
      // against fresh disk content (see loadFile's snapshot restore logic).
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
