<script lang="ts">
  import BackToPrev from "@/components/BackToPrev.svelte";
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import FormattedDate from "@/components/FormattedDate.svelte";
  import ReactionBar from "@/components/ReactionBar.svelte";
  import TableOfContents from "@/components/TableOfContents.svelte";
  import { staggerIn } from "@/lib/domEvent";
  import { getViews, trackView } from "@/lib/blog.remote";
  import type { Component } from "svelte";

  let { data } = $props();
  let post = $derived(data.metadata);
  let Content = $derived(data.content as Component);

  // Anchor the query to this component's reactive context
  // trackView calls getViews(slug).set(next) on server → auto-updates here
  const viewsQuery = $derived(getViews(data.id));

  let counted = false;
  let visibleSeconds = 0;
  let maxScroll = 0;
  let readingProgress = $state(0);

  const minSeconds = $derived(Math.max(10, (data.readingTime ?? 1) * 60 * 0.3));
  const scrollThreshold = 0.6;

  // Timer for genuine-reading tracking (pause when tab hidden)
  $effect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) {
        visibleSeconds++;
        checkAndCount();
      }
    }, 1000);
    return () => clearInterval(timer);
  });

  function handleScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable > 0) {
      const ratio = window.scrollY / scrollable;
      readingProgress = Math.min(100, ratio * 100);
      maxScroll = Math.max(maxScroll, ratio);
      checkAndCount();
    }
  }

  function checkAndCount() {
    if (counted) return;
    if (visibleSeconds >= minSeconds && maxScroll >= scrollThreshold) {
      counted = true;
      trackView(data.id).catch(() => {});
    }
  }
</script>

<svelte:window onscroll={handleScroll} />

<!-- Reading progress bar -->
<div class="fixed top-0 left-0 right-0 z-[51] h-0.5 bg-border/50" aria-hidden="true">
  <div
    class="h-full bg-primary transition-[width] duration-75 ease-linear"
    style:width="{readingProgress}%"
  ></div>
</div>

<TableOfContents />

<Container>
  <article>
    <div class="mt-10 mb-12">
      <h1 {@attach staggerIn} class="animate text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html post.title}
      </h1>
      <div {@attach staggerIn} class="animate flex items-center gap-1.5 mt-3">
        <div class="text-sm text-muted-foreground">
          <FormattedDate date={post.date} />
        </div>
        {#if data.readingTime}
          <span class="text-sm text-muted-foreground">&middot;</span>
          <div class="text-sm text-muted-foreground">
            {data.readingTime} 分鐘閱讀
          </div>
        {/if}
        {#if viewsQuery.current != null}
          <span class="text-sm text-muted-foreground">&middot;</span>
          <div class="text-sm text-muted-foreground">
            {viewsQuery.current} 次瀏覽
          </div>
        {/if}
        {#if post.draft}
          <div
            class="text-sm text-destructive border border-destructive rounded-lg px-2 py-0.5"
          >
            草稿
          </div>
        {/if}
      </div>
    </div>

    <div {@attach staggerIn} class="animate content">
      <Content />
    </div>

    <ReactionBar slug={data.id} />
  </article>

  <div {@attach staggerIn} class="animate flex mt-20">
    <BackToPrev />
    <BackToTop />
  </div>
</Container>
