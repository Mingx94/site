<script lang="ts">
  import Container from "@/components/Container.svelte";
  import Link from "@/components/Link.svelte";
  import { staggerIn } from "@/lib/domEvent";
  import { page } from "$app/state";
</script>

<Container>
  <div {@attach staggerIn} class="space-y-4 my-20 animate">
    <h1 class="text-3xl font-bold tracking-tight text-foreground">
      {page.status}
    </h1>
    <p class="text-muted-foreground">
      {#if page.status === 404}
        找不到這個頁面，它可能已被移動或刪除。
      {:else if page.status >= 500}
        伺服器發生了一些問題，請稍後再試。
      {:else}
        發生了一些問題，請稍後再試。
      {/if}
    </p>
    <div class="flex gap-3">
      <Link href="/">回到首頁</Link>
      <Link href="/blog">瀏覽文章</Link>
    </div>
  </div>
</Container>
