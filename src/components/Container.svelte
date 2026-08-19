<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="container">
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .container { inline-size: min(100% - 2.5rem, 64rem); margin-inline: auto; }
</style>
