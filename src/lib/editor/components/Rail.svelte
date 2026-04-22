<script lang="ts">
  import { tabs, setRailTab } from '$lib/editor/state/tabs.svelte';
  import { files } from '$lib/editor/state/files.svelte';
  import FrontmatterForm from './FrontmatterForm.svelte';
  import Outline from './Outline.svelte';
  import Palette from './Palette.svelte';
  import CoverPicker from './CoverPicker.svelte';

  const activeFile = $derived(tabs.active ? files.byPath[tabs.active] : null);
</script>

<aside class="rail">
  <div class="rail-tabs">
    <button class:on={tabs.railTab === 'fm'} onclick={() => setRailTab('fm')}>Frontmatter</button>
    <button class:on={tabs.railTab === 'toc'} onclick={() => setRailTab('toc')}>Outline</button>
    <button class:on={tabs.railTab === 'comp'} onclick={() => setRailTab('comp')}>Components</button>
  </div>
  <div class="rail-body">
    {#if !activeFile}
      <div class="outline-empty">（未開啟檔案）</div>
    {:else if tabs.railTab === 'fm'}
      <CoverPicker />
      <FrontmatterForm path={activeFile.path} />
    {:else if tabs.railTab === 'toc'}
      <Outline content={activeFile.content} />
    {:else}
      <Palette />
    {/if}
  </div>
</aside>
