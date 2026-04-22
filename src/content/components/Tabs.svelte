<script lang="ts">
  import * as Tabs from "@/components/ui/tabs";
  import type { Snippet } from "svelte";

  interface Props {
    tabs: string[];
    children: Snippet;
  }
  const { tabs, children }: Props = $props();
</script>

<Tabs.Root value={tabs[0]}>
  <Tabs.List>
    {#each tabs as tab (tab)}
      <Tabs.Trigger value={tab}>{tab}</Tabs.Trigger>
    {/each}
  </Tabs.List>
  {@render children()}
</Tabs.Root>
