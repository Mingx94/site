<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
  bind:ref
  data-slot="tabs-trigger"
  class={cn(
      "tabs-trigger",
    className,
  )}
  {...restProps}
/>

<style>
  :global(.tabs-trigger) {
    display: inline-flex;
    flex: 1;
    block-size: calc(100% - 1px);
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    padding: 0.25rem 0.5rem;
    outline: none;
    color: var(--foreground);
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    transition: color 150ms, box-shadow 150ms;
  }

  :global(.tabs-trigger[data-state="active"]) { background: var(--background); box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 8%, transparent); }
  :global(.tabs-trigger:focus-visible) { border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent); }
  :global(.tabs-trigger:disabled) { pointer-events: none; opacity: 0.5; }
  :global(.tabs-trigger svg) { flex-shrink: 0; pointer-events: none; }
  :global(.tabs-trigger svg:not([class*="size-"])) { inline-size: 1rem; block-size: 1rem; }
  :global(.dark .tabs-trigger) { color: var(--muted-foreground); }
  :global(.dark .tabs-trigger[data-state="active"]) { border-color: var(--input); background: color-mix(in oklch, var(--input) 30%, transparent); color: var(--foreground); }
</style>
