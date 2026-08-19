<script lang="ts">
  import { onMount } from "svelte";
  import { toggleTheme } from "@/lib/theme";
  import LucideMoon from "~icons/lucide/moon";
  import LucideMonitor from "~icons/lucide/monitor";
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

  let activeTheme = $state<"light" | "dark" | "system">("system");

  onMount(() => {
    const stored = localStorage.getItem("theme");
    activeTheme = (stored as "light" | "dark") ?? "system";
  });

  function onSelectTheme(theme: "light" | "dark" | "system") {
    activeTheme = theme;
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
    <LucideMonitor />
  {:else if theme === "dark"}
    <LucideMoon />
  {:else}
    <LucideSun />
  {/if}
{/snippet}

<Popover>
  <PopoverTrigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="outline"
        aria-label="主題設定"
        title="主題設定"
      >
        <RiPaletteLine />
      </Button>
    {/snippet}
  </PopoverTrigger>
  <PopoverContent align="end" width="fit">
    <div class="themes">
      {#each themeList as theme (theme.value)}
        <Button
          variant="outline"
          onclick={() => onSelectTheme(theme.value)}
          aria-pressed={activeTheme === theme.value}
          title={theme.name}
          class={activeTheme === theme.value ? "active" : ""}
        >
          {@render themeIcon(theme.value)}
        </Button>
      {/each}
    </div>
  </PopoverContent>
</Popover>

<style>
  .themes {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  :global(.themes svg),
  :global([aria-label="主題設定"] svg) {
    width: 1rem;
    height: 1rem;
  }
  :global(.themes .active) {
    color: var(--primary);
    border-color: color-mix(in oklch, var(--primary) 40%, transparent);
    background: color-mix(in oklch, var(--primary) 10%, transparent);
  }
</style>
