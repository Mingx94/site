<script lang="ts">
  import { toggleFont } from "@/lib/font";
  import { onMount } from "svelte";

  const fonts = [
    { value: "iansui", label: "芫荽" },
    { value: "huninn", label: "粉圓" },
  ] as const;

  let selected = $state("huninn");

  onMount(() => {
    const stored = localStorage.getItem("font");
    if (stored) selected = stored;
  });

  function toggle() {
    const next = selected === "huninn" ? "iansui" : "huninn";
    selected = next;
    localStorage.setItem("font", next);
    toggleFont(next);
  }
</script>

<div class="font-toggle">
  <button
    onclick={toggle}
    class="toggle"
    aria-label="切換字體：{fonts.find((f) => f.value === selected)?.label}"
  >
    <span class:dimmed={selected !== "iansui"} class="iansui">芫</span>
    <span class="divider">/</span>
    <span class:dimmed={selected !== "huninn"} class="huninn">粉</span>
  </button>
  <!-- Styled tooltip. Positioned BELOW the button because the header
       is `position: fixed; top: 0` (see src/styles/global.css `header`
       base rule), so rendering it above the button pushes it off the
       top of the viewport. -->
  <div
    class="tooltip"
    aria-hidden="true"
  >
    切換字型：<span class="iansui">芫荽</span> / <span class="huninn">粉圓</span>
  </div>
</div>

<style>
  .font-toggle { position: relative; }
  .toggle { display: inline-flex; align-items: center; gap: 0.125rem; border: 0; border-radius: var(--radius-md); padding: 0.25rem 0.5rem; background: transparent; color: var(--muted-foreground); font-size: 0.875rem; transition: color 200ms; }
  .toggle:hover { color: var(--foreground); }
  .iansui { font-family: var(--font-iansui); }
  .huninn { font-family: var(--font-huninn); }
  .dimmed { opacity: 0.4; }
  .divider { color: var(--border); }
  .tooltip { position: absolute; inset: 100% auto auto 50%; pointer-events: none; margin-block-start: 0.5rem; transform: translateX(-50%); border-radius: var(--radius-md); padding: 0.25rem 0.625rem; background: var(--foreground); color: var(--background); font-size: 0.75rem; white-space: nowrap; opacity: 0; transition: opacity 150ms; }
  .font-toggle:hover .tooltip { opacity: 1; }
</style>
