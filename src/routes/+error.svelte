<script lang="ts">
  import Container from "@/components/Container.svelte";
  import Link from "@/components/Link.svelte";
  import { staggerIn } from "@/lib/domEvent";

  let { status = 404 }: { status?: number } = $props();
</script>

<Container>
  <div {@attach staggerIn} class="error animate">
    <h1>
      {status}
    </h1>
    <p>
      {#if status === 404}
        找不到這個頁面，它可能已被移動或刪除。
      {:else if status >= 500}
        伺服器發生了一些問題，請稍後再試。
      {:else}
        發生了一些問題，請稍後再試。
      {/if}
    </p>
    <div class="links">
      <Link href="/">回到首頁</Link>
      <Link href="/blog">瀏覽文章</Link>
    </div>
  </div>
</Container>

<style>
  .error {
    margin-block: 5rem;
  }
  .error > * + * {
    margin-top: 1rem;
  }
  h1 {
    color: var(--foreground);
    font-size: 1.875rem;
    font-weight: 700;
    letter-spacing: -0.025em;
  }
  p {
    color: var(--muted-foreground);
  }
  .links {
    display: flex;
    gap: 0.75rem;
  }
</style>
