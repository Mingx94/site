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

  let counted = $state(false);
  let visibleSeconds = $state(0);
  let maxScroll = $state(0);
  let readingProgress = $state(0);

  const minSeconds = $derived(Math.max(10, (data.readingTime ?? 1) * 60 * 0.3));
  const scrollThreshold = 0.6;

  $effect(() => {
    // Drafts only render in dev (filterDrafts); no need to track views for
    // them — avoids polluting KV counters and running pointless timers
    // during hot-reload in dev.
    if (post.draft) return;
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
  og="/og/{data.id}.png"
/>

<svelte:head>
  <link rel="alternate" type="text/markdown" href="/blog/{data.id}.md" />
</svelte:head>

<svelte:window onscroll={handleScroll} />

<!-- Reading progress bar -->
<div class="progress-track" aria-hidden="true">
  <div
    class="progress"
    style:transform={`scaleX(${readingProgress / 100})`}
  ></div>
</div>

<TableOfContents />

<Container>
  <article>
    <!-- Masthead strip -->
    <div {@attach staggerIn} class="animate strip">
      <span>· Essay · {formatStamp(post.date)}</span>
      {#if post.draft}
        <span class="draft">Draft</span>
      {/if}
    </div>

    <!-- Title block -->
    <div class="title-block">
      <h1 {@attach staggerIn} class="animate page-title">
        {post.title}
      </h1>

      {#if post.description}
        <p {@attach staggerIn} class="animate introduction">
          {post.description}
        </p>
      {/if}
    </div>

    <!-- Byline ruler -->
    <div {@attach staggerIn} class="animate byline">
      <span>By Michael Tsai</span>
      <div class="byline-meta">
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
    <div
      {@attach staggerIn}
      class:no-drop-cap={post.dropCap === false}
      class="animate content"
    >
      <Content />
    </div>

    <ReactionBar slug={data.id} />

    <!-- Colophon -->
    <div class="colophon">
      <span>Filed {formatStamp(post.date)}</span>
      {#if post.updated}
        <span>Revised {formatStamp(post.updated)}</span>
      {/if}
    </div>
  </article>

  <div {@attach staggerIn} class="animate back-links">
    <BackToPrev />
    <BackToTop />
  </div>
</Container>

<style>
  .progress-track {
    position: fixed;
    z-index: 51;
    inset: 0 0 auto;
    height: 0.125rem;
    background: color-mix(in oklch, var(--border) 50%, transparent);
  }
  .progress {
    height: 100%;
    background: var(--primary);
    transform-origin: left;
    transition: transform 75ms linear;
  }
  article {
    padding-top: 1rem;
  }
  .strip {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    color: var(--muted-foreground);
    font: 11px var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .draft {
    color: var(--destructive);
  }
  .title-block {
    margin-block: 2rem 2.5rem;
  }
  .title-block > * + * {
    margin-top: 1.5rem;
  }
  .page-title {
    color: var(--foreground);
    font-size: clamp(2.25rem, 6vw, 4.5rem);
    font-family: var(--font-serif);
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1.05;
    text-wrap: balance;
  }
  .introduction {
    max-width: 42rem;
    color: var(--muted-foreground);
    font-size: 1.125rem;
    line-height: 1.625;
    font-family: var(--font-serif);
  }
  .byline,
  .colophon {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    color: var(--muted-foreground);
    font-family: var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .byline {
    gap: 0.5rem 1.5rem;
    margin-bottom: 3rem;
    padding-block: 0.75rem;
    border-block: 1px solid var(--border);
    font-size: 11px;
  }
  .byline-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25rem 1rem;
  }
  .colophon {
    row-gap: 0.5rem;
    margin-top: 4rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    font-size: 10px;
  }
  .back-links {
    display: flex;
    margin-top: 3rem;
  }
  @media (width >= 48rem) {
    article {
      padding-top: 2rem;
    }
    .title-block {
      margin-block: 3rem 3.5rem;
    }
    .introduction {
      font-size: 1.25rem;
    }
    .byline {
      margin-bottom: 4rem;
    }
  }
</style>
