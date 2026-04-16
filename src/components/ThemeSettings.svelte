<script lang="ts">
  import { toggleTheme } from "@/lib/theme";
  import LucideMoon from "~icons/lucide/moon";
  import LucideSun from "~icons/lucide/sun";
  import RiPaletteLine from "~icons/ri/palette-line";
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
    {#snippet child({ props })}
      <Button {...props} variant="outline" aria-label="主題設定" title="主題設定">
        <RiPaletteLine class="size-4" />
      </Button>
    {/snippet}
  </PopoverTrigger>
  <PopoverContent align="end" class="w-fit">
    <div class="flex items-center gap-1">
      {#each themeList as theme (theme.value)}
        <Button variant="outline" onclick={() => onSelectTheme(theme.value)}>
          {@render themeIcon(theme.value)}
        </Button>
      {/each}
    </div>
  </PopoverContent>
</Popover>
