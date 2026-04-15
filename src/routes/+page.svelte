<script lang="ts">
  import ArrowCard from "@/components/ArrowCard.svelte";
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import Link from "@/components/Link.svelte";
  import Social from "@/components/Social.svelte";
  import config from "@/config";
  import { staggerIn } from "@/lib/domEvent";

  interface Props {
    data: import("./$types").PageServerData;
  }

  const socialList = config.social;
  let { data }: Props = $props();
</script>

<Container>
  <div class="space-y-16">
    <section>
      <article>
        <h1 {@attach staggerIn} class="animate text-3xl font-semibold text-foreground mb-4">
          嗨，我是 Michael <span class="text-xl">👋</span>
        </h1>
        <p {@attach staggerIn} class="animate text-lg">
          現職前端工程師，工作上使用 React、Next.js 開發。
          喜歡拍照，部落格使用的圖片都是自己拍的。
        </p>
      </article>
      <Social
        source={socialList}
        className={{
          list: "flex flex-wrap gap-2 animate mt-2",
          item: "flex",
          icon: "size-5",
        }}
      />
    </section>

    <section {@attach staggerIn} class="animate space-y-6">
      <div class="flex flex-wrap gap-y-2 items-center justify-between">
        <h2 class="text-xl font-semibold text-foreground">最近發表的文章</h2>
        {#if data.showMoreLink}
          <Link href="/blog">更多文章</Link>
        {/if}
      </div>
      <ul class="flex flex-col gap-4">
        {#each data.recentBlogs as post}
          <li>
            <ArrowCard entry={post} />
          </li>
        {/each}
      </ul>
    </section>
  </div>

  <div {@attach staggerIn} class="animate flex mt-24">
    <BackToTop />
  </div>
</Container>
