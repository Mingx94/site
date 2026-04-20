<script lang="ts">
  import { tweaks, setTweak, togglePanel, type Tweaks } from '$state/tweaks.svelte';

  type Opt<K extends keyof Tweaks> = { v: Tweaks[K]; l: string };

  const paperOpts: Opt<'paperTone'>[] = [
    { v: 'warm', l: '暖' },
    { v: 'cool', l: '冷' },
    { v: 'neutral', l: '中' },
  ];
  const accentOpts: Opt<'accent'>[] = [
    { v: 'red', l: '朱' },
    { v: 'blue', l: '藍' },
    { v: 'green', l: '綠' },
    { v: 'purple', l: '紫' },
  ];
  const fontOpts: Opt<'editorFont'>[] = [
    { v: 'mono', l: '等寬' },
    { v: 'serif', l: '襯線' },
    { v: 'hand', l: '手寫' },
  ];
  const densityOpts: Opt<'density'>[] = [
    { v: 'cozy', l: '舒適' },
    { v: 'dense', l: '緊湊' },
  ];
</script>

<div class="tweaks-panel">
  <div class="tk-head">
    <span class="tk-title">Tweaks</span>
    <span class="tk-sub">設計調整</span>
    <button class="tk-close" onclick={togglePanel} aria-label="關閉">×</button>
  </div>
  <div class="tk-row">
    <span class="tk-label">紙張色調</span>
    <div class="tk-seg">
      {#each paperOpts as o (o.v)}
        <button class:on={tweaks.paperTone === o.v} onclick={() => setTweak('paperTone', o.v)}>{o.l}</button>
      {/each}
    </div>
  </div>
  <div class="tk-row">
    <span class="tk-label">重點色</span>
    <div class="tk-seg">
      {#each accentOpts as o (o.v)}
        <button class:on={tweaks.accent === o.v} onclick={() => setTweak('accent', o.v)}>{o.l}</button>
      {/each}
    </div>
  </div>
  <div class="tk-row">
    <span class="tk-label">編輯器字體</span>
    <div class="tk-seg">
      {#each fontOpts as o (o.v)}
        <button class:on={tweaks.editorFont === o.v} onclick={() => setTweak('editorFont', o.v)}>{o.l}</button>
      {/each}
    </div>
  </div>
  <div class="tk-row">
    <span class="tk-label">密度</span>
    <div class="tk-seg">
      {#each densityOpts as o (o.v)}
        <button class:on={tweaks.density === o.v} onclick={() => setTweak('density', o.v)}>{o.l}</button>
      {/each}
    </div>
  </div>
</div>
