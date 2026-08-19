<script lang="ts">
  import * as Tabs from "@/components/ui/tabs";
  import type { Snippet } from "svelte";

  interface Props {
    name: string;
    children: Snippet;
  }

  let { name, children }: Props = $props();
</script>

<Tabs.Content value={name} class="article-tab">
  {@render children()}
</Tabs.Content>

<style>
  :global(.article-tab) {
    padding-inline: 1rem;
    border: 1px solid var(--border);
  }
</style>
