<script lang="ts">
  import Container from "@/components/Container.svelte";
  import Link from "@/components/Link.svelte";
  import { staggerIn } from "@/lib/domEvent";
  import { page } from "$app/state";
</script>

<Container>
  <div {@attach staggerIn} class="space-y-4 my-20 animate">
    <h1 class="text-2xl font-semibold text-black dark:text-white">
      {page.status} — {page.error?.message ?? "發生錯誤"}
    </h1>
    <p>這個頁面不存在或已被移除。</p>
    <Link href="/">回到首頁</Link>
  </div>
</Container>
