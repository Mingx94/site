<script lang="ts">
  import { extractOutline } from '$lib/editor/outline';
  import { parseDoc } from '$lib/editor/frontmatter';
  import { ui } from '$lib/editor/state/ui.svelte';

  type Props = { content: string };
  const { content }: Props = $props();

  const body = $derived(parseDoc(content).body);
  const headings = $derived(extractOutline(body));

  function jump(slug: string) {
    ui.outlineActive = slug;
    const el = document.getElementById(slug) ?? document.querySelector(`[id="${slug}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

{#if headings.length === 0}
  <div class="outline-empty">（沒有標題）</div>
{:else}
  <ul class="outline">
    {#each headings as h, i (h.slug + i)}
      <li class="ol-{h.level}" class:on={ui.outlineActive === h.slug}>
        <button
          type="button"
          class="ol-link"
          onclick={() => jump(h.slug)}
        >
          <span class="ol-bullet">{'—'.repeat(Math.max(1, h.level - 1))}</span>
          {h.text}
        </button>
      </li>
    {/each}
  </ul>
{/if}
