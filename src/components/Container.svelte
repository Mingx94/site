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
    max-inline-size: 92rem;
    margin-inline: auto;
    padding-inline: clamp(1rem, 4vw, 3.25rem);
  }
</style>
