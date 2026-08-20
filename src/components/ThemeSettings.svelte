<script lang="ts">
  import { onMount } from "svelte";
  import { toggleTheme } from "@/lib/theme";
  import LucideMoon from "~icons/lucide/moon";
  import LucideMonitor from "~icons/lucide/monitor";
  import LucideSun from "~icons/lucide/sun";
  import { Button } from "./ui/button";

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
    if (stored === "light" || stored === "dark") {
      activeTheme = stored;
    } else {
      activeTheme = "system";
      if (stored !== null) {
        localStorage.removeItem("theme");
      }
    }
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

<div class="theme-settings" role="group" aria-label="色彩主題">
  <span class="theme-label" aria-hidden="true">主題</span>
  <div class="themes">
    {#each themeList as theme (theme.value)}
      <Button
        variant="ghost"
        size="sm"
        onclick={() => onSelectTheme(theme.value)}
        aria-pressed={activeTheme === theme.value}
        title="切換為{theme.name}主題"
        class="theme-option {activeTheme === theme.value ? 'active' : ''}"
      >
        {@render themeIcon(theme.value)}
        <span>{theme.name}</span>
      </Button>
    {/each}
  </div>
</div>

<style>
  .theme-settings,
  .themes {
    display: flex;
    align-items: center;
  }
  .theme-settings {
    gap: 0.5rem;
  }
  .theme-label {
    color: var(--muted-foreground);
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.14em;
  }
  .themes {
    gap: 0.25rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 0.125rem;
    background: color-mix(in srgb, var(--card) 72%, transparent);
  }
  :global(.theme-option) {
    color: var(--muted-foreground) !important;
    background: transparent;
  }
  :global(.theme-option svg) {
    width: 1rem;
    height: 1rem;
  }
  :global(.theme-option:hover) {
    color: var(--foreground) !important;
    background: color-mix(in oklch, var(--primary) 8%, transparent);
  }
  :global(.theme-option.active) {
    color: var(--primary) !important;
    background: color-mix(in oklch, var(--primary) 10%, transparent);
  }
  @media (width < 40rem) {
    :global(.theme-option) {
      padding-inline: 0.5rem;
    }
    :global(.theme-option svg) {
      display: none;
    }
  }
</style>
