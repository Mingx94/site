<script lang="ts">
  import { toggleFont } from "@/lib/font";
  import { onMount } from "svelte";

  let selected = $state<"serif" | "sans">("serif");

  onMount(() => {
    const stored = localStorage.getItem("font");
    if (stored === "serif" || stored === "sans") selected = stored;
  });

  function toggle() {
    const next = selected === "serif" ? "sans" : "serif";
    selected = next;
    localStorage.setItem("font", next);
    toggleFont(next);
  }
</script>

<div class="font-toggle">
  <button
    onclick={toggle}
    class="toggle"
    aria-label="切換閱讀字體，目前是 {selected === 'serif'
      ? 'Iansui 襯體'
      : 'Huninn 黑體'}"
    title="切換黑體／襯體"
  >
    <span class:dimmed={selected !== "serif"} class="serif">襯</span>
    <span class="divider">/</span>
    <span class:dimmed={selected !== "sans"} class="sans">黑</span>
  </button>
  <!-- Styled tooltip. Positioned BELOW the button because the header
       is `position: fixed; top: 0` (see src/styles/global.css `header`
       base rule), so rendering it above the button pushes it off the
       top of the viewport. -->
  <div class="tooltip" aria-hidden="true">
    閱讀字體：<span class="sans">Huninn 黑體</span> /
    <span class="serif">Iansui 襯體</span>
  </div>
</div>

<style>
  .font-toggle {
    position: relative;
  }
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    border: 0;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    padding: 0.25rem 0.5rem;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition: color 200ms;
  }
  .toggle:hover {
    color: var(--foreground);
  }
  .serif {
    font-family: var(--font-serif);
  }
  .sans {
    font-family: var(--font-sans);
  }
  .dimmed {
    opacity: 0.4;
  }
  .divider {
    color: var(--border);
  }
  .tooltip {
    position: absolute;
    inset: 100% auto auto 50%;
    pointer-events: none;
    margin-block-start: 0.5rem;
    transform: translateX(-50%);
    border-radius: var(--radius-md);
    padding: 0.25rem 0.625rem;
    background: var(--foreground);
    color: var(--background);
    font-size: 0.6875rem;
    line-height: 1rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 150ms;
  }
  .font-toggle:hover .tooltip {
    opacity: 1;
  }
  .toggle:focus-visible {
    border-color: var(--ring);
    outline: none;
  }
</style>
