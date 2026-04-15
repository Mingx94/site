<script lang="ts">
  import BackToPrev from "@/components/BackToPrev.svelte";
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import FormattedDate from "@/components/FormattedDate.svelte";
  import ReactionBar from "@/components/ReactionBar.svelte";
  import TableOfContents from "@/components/TableOfContents.svelte";
  import { staggerIn } from "@/lib/domEvent";
  import { onMount } from "svelte";
  import type { Component } from "svelte";

  let { data } = $props();
  let post = $derived(data.metadata);
  let Content = $derived(data.content as Component);
  let views = $state<number | null>(null);
  let counted = false;

  onMount(() => {
    // Fetch current view count (read only)
    fetch(`/api/views/${data.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => { if (json) views = json.views; })
      .catch(() => {});

    // Track genuine reading: time spent (visible) + scroll depth
    const minSeconds = Math.max(10, (data.readingTime ?? 1) * 60 * 0.3);
    const scrollThreshold = 0.6;
    let visibleSeconds = 0;
    let maxScroll = 0;
    let timer: ReturnType<typeof setInterval>;

    function checkAndCount() {
      if (counted) return;
      if (visibleSeconds >= minSeconds && maxScroll >= scrollThreshold) {
        counted = true;
        clearInterval(timer);
        fetch(`/api/views/${data.id}`, { method: "POST" })
          .then((r) => r.ok ? r.json() : null)
          .then((json) => { if (json) views = json.views; })
          .catch(() => {});
      }
    }

    // Count visible time (pause when tab is hidden)
    timer = setInterval(() => {
      if (!document.hidden) {
        visibleSeconds++;
        checkAndCount();
      }
    }, 1000);

    // Track scroll depth
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) {
        maxScroll = Math.max(maxScroll, window.scrollY / scrollable);
        checkAndCount();
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", onScroll);
    };
  });
</script>

<TableOfContents />

<Container>
  <article>
    <div class="space-y-1 my-10">
      <div use:staggerIn class="animate flex items-center gap-1.5">
        <div class="text-sm">
          <FormattedDate date={post.date} />
        </div>
        {#if data.readingTime}
          <span class="text-sm text-muted-foreground">&middot;</span>
          <div class="text-sm text-muted-foreground">
            {data.readingTime} min read
          </div>
        {/if}
        {#if views !== null}
          <span class="text-sm text-muted-foreground">&middot;</span>
          <div class="text-sm text-muted-foreground">
            {views} views
          </div>
        {/if}
        {#if post.draft}
          <div
            class="text-sm text-red-500 border border-red-500 rounded-lg px-2 py-0.5"
          >
            Draft
          </div>
        {/if}
      </div>
      <h1 use:staggerIn class="animate text-2xl font-semibold text-black dark:text-white">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html post.title}
      </h1>
    </div>

    <div use:staggerIn class="animate content">
      <Content />
    </div>

    <ReactionBar slug={data.id} />
  </article>

  <div use:staggerIn class="animate flex mt-16">
    <BackToPrev />
    <BackToTop />
  </div>
</Container>
