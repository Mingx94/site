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

  import { workspace, loadWorkspace } from '$state/workspace.svelte';
  import { tabs, closeTab, toggleRail } from '$state/tabs.svelte';
  import { saveFile, dirtyCount } from '$state/files.svelte';
  import { loadTweaks, togglePanel, tweaks } from '$state/tweaks.svelte';
  import { ui, toggleCmd, closeCmd } from '$state/ui.svelte';

  onMount(() => {
    const keyHandler = async (ev: KeyboardEvent) => {
      const mod = ev.metaKey || ev.ctrlKey;
      if (mod && ev.key.toLowerCase() === 'k') {
        ev.preventDefault();
        toggleCmd();
      } else if (mod && ev.key.toLowerCase() === 's') {
        ev.preventDefault();
        if (tabs.active) await saveFile(tabs.active);
      } else if (mod && ev.key.toLowerCase() === 'w') {
        ev.preventDefault();
        if (tabs.active) closeTab(tabs.active);
      } else if (mod && ev.key === '\\') {
        ev.preventDefault();
        toggleRail();
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

    (async () => {
      await loadTweaks();
      await loadWorkspace();
    })();

    return () => {
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('beforeunload', onBeforeUnload);
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
              : '從左側選一個 .svx 或 .md 開始編輯'}
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
