<script lang="ts">
  import BackToPrev from "@/components/BackToPrev.svelte";
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import FormattedDate from "@/components/FormattedDate.svelte";
  import ReactionBar from "@/components/ReactionBar.svelte";
  import Seo from "@/components/Seo.svelte";
  import TableOfContents from "@/components/TableOfContents.svelte";
  import Cover from "@/content/components/Cover.svelte";
  import { staggerIn } from "@/lib/domEvent";
  import { getViews, trackView } from "@/lib/blog.remote";
  import type { Component } from "svelte";

  let { data } = $props();
  let post = $derived(data.metadata);
  let Content = $derived(data.content as Component);

  const viewsQuery = $derived(getViews(data.id));

  let counted = false;
  let visibleSeconds = 0;
  let maxScroll = 0;
  let readingProgress = $state(0);

  const minSeconds = $derived(Math.max(10, (data.readingTime ?? 1) * 60 * 0.3));
  const scrollThreshold = 0.6;

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
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
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

  function formatStamp(d: Date | string | undefined): string {
    if (!d) return "";
    const date = new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  }
</script>

<Seo
  title="{post.title} | Vartifact"
  description={post.description}
  og="/og/{encodeURIComponent(data.id)}"
/>

<svelte:window onscroll={handleScroll} />

<!-- Reading progress bar -->
<div
  class="fixed top-0 right-0 left-0 z-[51] h-0.5 bg-border/50"
  aria-hidden="true"
>
  <div
    class="h-full bg-primary transition-[width] duration-75 ease-linear"
    style:width="{readingProgress}%"
  ></div>
</div>

<TableOfContents />

<Container>
  <article class="pt-4 md:pt-8">
    <!-- Masthead strip -->
    <div
      {@attach staggerIn}
      class="animate flex items-baseline justify-between gap-4 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
    >
      <span>· Essay · {formatStamp(post.date)}</span>
      {#if post.draft}
        <span class="text-destructive">Draft</span>
      {/if}
    </div>

    <!-- Title block -->
    <div class="mt-8 md:mt-12 mb-10 md:mb-14 space-y-6">
      <h1
        {@attach staggerIn}
        class="animate text-balance font-bold leading-[1.05] tracking-tight text-foreground text-[clamp(2.25rem,6vw,4.5rem)]"
      >
        {post.title}
      </h1>

      {#if post.description}
        <p
          {@attach staggerIn}
          class="animate max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground"
        >
          {post.description}
        </p>
      {/if}
    </div>

    <!-- Byline ruler -->
    <div
      {@attach staggerIn}
      class="animate flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-y border-border py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-12 md:mb-16"
    >
      <span>By Michael Tsai</span>
      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <FormattedDate date={post.date} />
        {#if data.readingTime}
          <span aria-hidden="true">·</span>
          <span>{data.readingTime} min read</span>
        {/if}
        {#if viewsQuery.current != null}
          <span aria-hidden="true">·</span>
          <span>{viewsQuery.current} views</span>
        {/if}
      </div>
    </div>

    <!-- Cover image (full article width — visual anchor) -->
    <Cover title={post.title} />

    <!-- Content -->
    <div {@attach staggerIn} class="animate content">
      <Content />
    </div>

    <ReactionBar slug={data.id} />

    <!-- Colophon -->
    <div
      class="mt-16 flex flex-wrap items-baseline justify-between gap-y-2 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
    >
      <span>Filed {formatStamp(post.date)}</span>
      {#if post.updated}
        <span>Revised {formatStamp(post.updated)}</span>
      {/if}
    </div>
  </article>

  <div {@attach staggerIn} class="animate mt-12 flex">
    <BackToPrev />
    <BackToTop />
  </div>
</Container>
