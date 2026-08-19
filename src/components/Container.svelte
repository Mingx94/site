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
  .container {
    inline-size: 100%;
    max-inline-size: 64rem;
    margin-inline: auto;
    padding-inline: 1.25rem;
  }
</style>
