<script lang="ts">
  import { tabs, setPreviewMode, toggleRail } from '$state/tabs.svelte';
  import { applyMarkdown } from '$lib/editor-actions';

  function act(cmd: Parameters<typeof applyMarkdown>[0]) {
    applyMarkdown(cmd);
  }
</script>

<div class="toolbar">
  <button class="tbtn b" title="粗體 ⌘B" onclick={() => act('bold')}>B</button>
  <button class="tbtn i" title="斜體 ⌘I" onclick={() => act('italic')}>I</button>
  <button class="tbtn s" title="刪除線" onclick={() => act('strike')}>S</button>
  <div class="tsep"></div>
  <button class="tbtn" title="標題 1" onclick={() => act('h1')}>H1</button>
  <button class="tbtn" title="標題 2" onclick={() => act('h2')}>H2</button>
  <button class="tbtn" title="標題 3" onclick={() => act('h3')}>H3</button>
  <div class="tsep"></div>
  <button class="tbtn" title="連結" onclick={() => act('link')}>🔗</button>
  <button class="tbtn" title="程式碼" onclick={() => act('code')}>{'</>'}</button>
  <button class="tbtn" title="引用" onclick={() => act('quote')}>❝</button>
  <button class="tbtn" title="清單" onclick={() => act('ul')}>• ─</button>
  <button class="tbtn" title="編號清單" onclick={() => act('ol')}>1. ─</button>
  <button class="tbtn" title="待辦" onclick={() => act('task')}>☐</button>
  <div class="tsep"></div>
  <button class="tbtn" title="分隔線" onclick={() => act('hr')}>— —</button>
  <div class="tfill"></div>
  <div class="preview-seg">
    <button class:on={tabs.previewMode === 'split'} onclick={() => setPreviewMode('split')}>並排</button>
    <button class:on={tabs.previewMode === 'edit'} onclick={() => setPreviewMode('edit')}>只編輯</button>
    <button class:on={tabs.previewMode === 'preview'} onclick={() => setPreviewMode('preview')}>只預覽</button>
  </div>
  <button class="tbtn rail-toggle" title="右欄 ⌘\" onclick={toggleRail}>
    {tabs.railOpen ? '▸│' : '│▸'}
  </button>
</div>
