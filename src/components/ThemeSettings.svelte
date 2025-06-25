<script lang="ts">
  import { toggleTheme } from "@/lib/theme";
  import { onMount } from "svelte";
  import LucideMoon from "~icons/lucide/moon";
  import LucideSun from "~icons/lucide/sun";
  import RiPaletteLine from "~icons/ri/palette-line";
  import FontSelect from "./FontSelect.svelte";
  import { Button } from "./ui/button";
  import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

  const themeList = [
    {
      name: "淺色",
      value: "light",
    },
    {
      name: "深色",
      value: "dark",
    },
    {
      name: "系統",
      value: "system",
    },
  ] as const;

  function onSelectTheme(theme: "light" | "dark" | "system") {
    if (theme === "system") {
      toggleTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
      localStorage.removeItem("theme");
    } else {
      toggleTheme(theme === "dark");
      localStorage.setItem("theme", theme);
    }
  }

  onMount(() => {
    const handleThemeChange = () => {
      if (!localStorage.getItem("theme")) {
        toggleTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", handleThemeChange);

    return () => {
      media.removeEventListener("change", handleThemeChange);
    };
  });
</script>

{#snippet themeIcon(theme: "light" | "dark" | "system")}
  {#if theme === "system"}
    <p>系統</p>
  {:else if theme === "dark"}
    <LucideMoon class="size-4" />
  {:else}
    <LucideSun class="size-4" />
  {/if}
{/snippet}

<Popover>
  <PopoverTrigger>
    <Button variant="outline" aria-label="主題設定" title="主題設定">
      <RiPaletteLine class="size-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent align="end" class="w-fit">
    <div class="grid gap-x-4 grid-cols-[auto_1fr] gap-y-1">
      <p class="text-sm self-center">暗色模式</p>
      <div class="flex items-center gap-1">
        {#each themeList as theme (theme.value)}
          <Button variant="outline" onclick={() => onSelectTheme(theme.value)}>
            {@render themeIcon(theme.value)}
          </Button>
        {/each}
      </div>

      <p class="text-sm self-center">字體</p>
      <FontSelect />
    </div>
  </PopoverContent>
</Popover>
