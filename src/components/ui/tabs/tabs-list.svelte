<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
  bind:ref
  data-slot="tabs-list"
  class={cn(
      "tabs-list",
    className,
  )}
  {...restProps}
/>

<style>
  :global(.tabs-list) {
    display: inline-flex;
    inline-size: fit-content;
    block-size: 2.25rem;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    padding: 3px;
    background: var(--muted);
    color: var(--muted-foreground);
  }
</style>
