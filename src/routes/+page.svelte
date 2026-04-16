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
  <div class="space-y-20">
    <section>
      <article class="space-y-4">
        <p
          {@attach staggerIn}
          class="animate text-sm font-medium text-primary tracking-widest uppercase"
        >
          Michael Tsai
        </p>
        <h1
          {@attach staggerIn}
          class="animate text-4xl font-bold tracking-tight text-foreground leading-snug"
        >
          前端工程師，<br class="hidden sm:block" />打造細緻的網路體驗。
        </h1>
        <p {@attach staggerIn} class="animate text-lg text-muted-foreground leading-relaxed">
          專注在 Web 技術與使用者體驗，熱愛把細節做到位。也喜歡用鏡頭記錄生活。
        </p>
      </article>
      <Social
        source={socialList}
        className={{
          list: "flex flex-wrap gap-2 animate mt-5",
          item: "flex",
          icon: "size-5",
        }}
      />
    </section>

    <section {@attach staggerIn} class="animate space-y-6">
      <div class="flex flex-wrap gap-y-2 items-baseline justify-between">
        <h2 class="text-xl font-bold text-foreground">最近發表</h2>
        {#if data.showMoreLink}
          <Link href="/blog" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
            所有文章 →
          </Link>
        {/if}
      </div>
      <ul class="flex flex-col gap-4">
        {#each data.recentBlogs as post (post.id)}
          <li>
            <ArrowCard entry={post} />
          </li>
        {/each}
      </ul>
    </section>
  </div>

  <div {@attach staggerIn} class="animate flex mt-20">
    <BackToTop />
  </div>
</Container>
