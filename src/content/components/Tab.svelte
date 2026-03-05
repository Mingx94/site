<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    name: string;
    children: Snippet;
  }

  let { name, children }: Props = $props();
</script>

<div data-name={name} class="border border-border px-4">
  {@render children()}
</div>
