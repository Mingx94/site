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

<button
  onclick={toggle}
  class="inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
  title="切換字體"
  aria-label="切換字體：{fonts.find((f) => f.value === selected)?.label}"
>
  <span class="font-iansui" class:opacity-40={selected !== "iansui"}>芫</span>
  <span class="text-border">/</span>
  <span class="font-huninn" class:opacity-40={selected !== "huninn"}>粉</span>
</button>
