<script lang="ts">
  import { onMount } from "svelte";
  import { toggleTheme } from "@/lib/theme";

  const themeList = [
    {
      name: "淺色",
      shortName: "淺",
      value: "light",
    },
    {
      name: "深色",
      shortName: "深",
      value: "dark",
    },
    {
      name: "系統",
      shortName: "系",
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

<div class="theme-settings" role="group" aria-label="色彩主題">
  <span class="theme-label" aria-hidden="true">主題</span>
  {#each themeList as theme, index (theme.value)}
    {#if index > 0}
      <span class="divider" aria-hidden="true">/</span>
    {/if}
    <button
      type="button"
      onclick={() => onSelectTheme(theme.value)}
      aria-pressed={activeTheme === theme.value}
      aria-label="{theme.name}主題"
      title="切換為{theme.name}主題"
      class:active={activeTheme === theme.value}
      class="theme-option"
    >
      {theme.shortName}
    </button>
  {/each}
</div>

<style>
  .theme-settings {
    display: flex;
    align-items: center;
    color: var(--muted-foreground);
    font-family: var(--font-sans);
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  .theme-label {
    margin-inline-end: 0.375rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.14em;
  }
  .theme-option {
    display: inline-flex;
    min-inline-size: 1.75rem;
    min-block-size: 2rem;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    padding: 0.25rem 0.375rem;
    background: transparent;
    color: var(--muted-foreground);
    line-height: 1;
    transition:
      color 150ms,
      background-color 150ms;
  }
  .theme-option:hover {
    color: var(--foreground);
    background: color-mix(in oklch, var(--primary) 8%, transparent);
  }
  .theme-option.active {
    color: var(--primary);
    font-weight: 600;
  }
  .theme-option:focus-visible {
    border-color: var(--ring);
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
  }
  .divider {
    color: var(--border);
  }
  @media (width < 64rem), (pointer: coarse) {
    .theme-option {
      min-inline-size: 2.75rem;
      min-block-size: 2.75rem;
    }
  }
</style>
