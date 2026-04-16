<script lang="ts">
  import ArrowCard from "@/components/ArrowCard.svelte";
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import { staggerIn } from "@/lib/domEvent";
  import type { Post } from "@/lib/posts";

  interface Props {
    data: import("./$types").PageServerData;
  }

  let { data }: Props = $props();

  let query = $state("");

  const allPosts = $derived(
    data.years.flatMap((year) => data.posts[year] as Post[]),
  );

  const filtered = $derived(
    query.trim() === ""
      ? null
      : allPosts.filter((post) => {
          const q = query.toLowerCase();
          return (
            post.title.toLowerCase().includes(q) ||
            (post.description ?? "").toLowerCase().includes(q)
          );
        }),
  );
</script>

<Container>
  <div class="space-y-12">
    <div class="space-y-4">
      <h1 {@attach staggerIn} class="animate text-3xl font-bold tracking-tight text-foreground">
        文章
      </h1>

      <div {@attach staggerIn} class="animate">
        <label for="blog-search" class="sr-only">搜尋文章</label>
        <input
          id="blog-search"
          type="search"
          bind:value={query}
          placeholder="搜尋文章…"
          class="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    </div>

    {#if filtered !== null}
      <div class="space-y-3">
        <p class="text-sm text-muted-foreground">
          找到 {filtered.length} 篇{query.trim() ? `「${query.trim()}」相關` : ""}文章
        </p>
        {#if filtered.length > 0}
          <ul class="flex flex-col gap-3">
            {#each filtered as post (post.id)}
              <li>
                <ArrowCard entry={post} />
              </li>
            {/each}
          </ul>
        {:else}
          <p class="py-12 text-center text-muted-foreground">找不到相關文章。</p>
        {/if}
      </div>
    {:else}
      <div class="space-y-10">
        {#each data.years as year (year)}
          <section {@attach staggerIn} class="animate space-y-3">
            <h2 class="text-lg font-semibold text-muted-foreground">{year}</h2>
            <ul class="flex flex-col gap-3">
              {#each data.posts[year] as post (post.id)}
                <li>
                  <ArrowCard entry={post} />
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    {/if}
  </div>

  <div {@attach staggerIn} class="animate flex mt-20">
    <BackToTop />
  </div>
</Container>
