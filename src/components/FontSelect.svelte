<script lang="ts">
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "@/components/ui/select";
  import { toggleFont } from "@/lib/font";
  import { onMount } from "svelte";

  const fontList = [
    {
      name: "芫荽體",
      value: "iansui",
      className: "font-iansui",
    },
    {
      name: "粉圓體",
      value: "huninn",
      className: "font-huninn",
    },
  ];

  let selectedFont = $state("iansui");

  onMount(() => {
    if (typeof window === "undefined") return;

    const localFont = localStorage.getItem("font");
    if (localFont) {
      selectedFont = localFont;
    }
  });

  function handleChange(value: string) {
    selectedFont = value;
    localStorage.setItem("font", value);

    toggleFont(value);
  }

  const font = $derived(fontList.find((font) => font.value === selectedFont));
</script>

<Select type="single" value={selectedFont} onValueChange={handleChange}>
  <SelectTrigger class={font?.className}>
    <span data-slot="select-value">
      {font?.name}
    </span>
  </SelectTrigger>
  <SelectContent>
    {#each fontList as font (font.value)}
      <SelectItem value={font.value} class={font.className}>
        {font.name}
      </SelectItem>
    {/each}
  </SelectContent>
</Select>
