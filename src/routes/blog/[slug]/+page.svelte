<script lang="ts">
  import BackToPrev from "@/components/BackToPrev.svelte";
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import FormattedDate from "@/components/FormattedDate.svelte";
  import ReactionBar from "@/components/ReactionBar.svelte";
  import TableOfContents from "@/components/TableOfContents.svelte";
  import { onMount } from "svelte";
  import type { Component } from "svelte";

  let { data } = $props();
  let post = $derived(data.metadata);
  let Content = $derived(data.content as Component);
  let views = $state<number | null>(null);

  onMount(async () => {
    try {
      const res = await fetch(`/api/views/${data.id}`, { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        views = json.views;
      }
    } catch {
      // ignore — KV may not be available in dev
    }
  });
</script>

<TableOfContents />

<Container>
  <article>
    <div class="space-y-1 my-10">
      <div class="animate flex items-center gap-1.5">
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
      <h1 class="animate text-2xl font-semibold text-black dark:text-white">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html post.title}
      </h1>
    </div>

    <div class="animate content">
      <Content />
    </div>

    <ReactionBar slug={data.id} />
  </article>

  <div class="animate flex mt-16">
    <BackToPrev />
    <BackToTop />
  </div>
</Container>
