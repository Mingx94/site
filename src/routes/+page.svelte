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
        <h4 use:staggerIn class="animate font-semibold text-black dark:text-white mb-1">
          嗨，我是 Michael <span class="text-xl">👋</span>
        </h4>
        <p use:staggerIn class="animate mb-2">
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

    <section use:staggerIn class="animate space-y-6">
      <div class="flex flex-wrap gap-y-2 items-center justify-between">
        <h5 class="font-semibold text-black dark:text-white">最近發表的文章</h5>
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

  <div use:staggerIn class="animate flex mt-24">
    <BackToTop />
  </div>
</Container>
