<script lang="ts">
  import Container from "@/components/Container.svelte";
  import Link from "@/components/Link.svelte";
  import { staggerIn } from "@/lib/domEvent";
  import { page } from "$app/state";
</script>

<Container>
  <div {@attach staggerIn} class="space-y-4 my-20 animate">
    <h1 class="text-2xl font-semibold text-foreground">
      {page.status} — {page.error?.message ?? "發生錯誤"}
    </h1>
    <p>
      {#if page.status === 404}
        這個頁面不存在或已被移除。
      {:else if page.status >= 500}
        伺服器發生錯誤，請稍後再試。
      {:else}
        發生錯誤，請稍後再試。
      {/if}
    </p>
    <Link href="/">回到首頁</Link>
  </div>
</Container>
