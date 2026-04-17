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

<div class="group relative">
  <button
    onclick={toggle}
    class="inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
    aria-label="切換字體：{fonts.find((f) => f.value === selected)?.label}"
  >
    <span class="font-iansui" class:opacity-40={selected !== "iansui"}>芫</span>
    <span class="text-border">/</span>
    <span class="font-huninn" class:opacity-40={selected !== "huninn"}>粉</span>
  </button>
  <!-- Styled tooltip -->
  <div
    class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs text-background opacity-0 transition-opacity duration-150 group-hover:opacity-100"
    aria-hidden="true"
  >
    切換字型：<span class="font-iansui">芫荽</span> / <span class="font-huninn">粉圓</span>
  </div>
</div>
