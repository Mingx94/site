<script lang="ts">
  import * as Tabs from "@/components/ui/tabs";
  import type { Snippet } from "svelte";

  interface Props {
    name: string;
    children: Snippet;
  }

  let { name, children }: Props = $props();
</script>

<Tabs.Content value={name} class="border border-border px-4">
  {@render children()}
</Tabs.Content>
