<script lang="ts">
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import FormattedDate from "@/components/FormattedDate.svelte";
  import Seo from "@/components/Seo.svelte";
  import { staggerIn } from "@/lib/domEvent";
  import type { Post } from "@/lib/posts";
  import RiArrowRightUpLine from "~icons/ri/arrow-right-up-line";
  import RiSearchLine from "~icons/ri/search-line";

  interface Props {
    data: import("./$types").PageServerData;
  }

  let { data }: Props = $props();

  let query = $state("");

  const allPosts = $derived(
    data.years.flatMap((year) => data.posts[year] as Post[]),
  );

  const total = $derived(allPosts.length);

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

<Seo title="文章 | Vartifact" description="技術隨筆、閱讀筆記，以及其他片段。" />

<Container>
  <div class="pt-4 md:pt-8 pb-8">
    <!-- Masthead strip -->
    <div
      {@attach staggerIn}
      class="animate flex items-baseline justify-between gap-4 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
    >
      <span>· Archive · Writing</span>
      <span>{String(total).padStart(2, "0")} entries</span>
    </div>

    <!-- Title block -->
    <div class="mt-8 md:mt-12 mb-10 md:mb-14 space-y-6">
      <h1
        {@attach staggerIn}
        class="animate font-bold leading-[0.95] tracking-tighter text-foreground"
        style="font-size: clamp(3rem, 10vw, 6rem);"
      >
        文章<span class="text-primary">.</span>
      </h1>

      <p
        {@attach staggerIn}
        class="animate max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground"
      >
        技術隨筆、閱讀筆記，以及其他片段——<br class="hidden md:inline" />
        這裡是我把想清楚的東西寫下來的地方。
      </p>
    </div>

    <!-- Search -->
    <div
      {@attach staggerIn}
      class="animate relative border-y border-border mb-10 md:mb-14"
    >
      <RiSearchLine
        class="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
      />
      <label for="blog-search" class="sr-only">搜尋文章</label>
      <input
        id="blog-search"
        type="search"
        bind:value={query}
        placeholder="搜尋..."
        class="w-full bg-transparent py-4 pl-7 pr-4 text-base placeholder:text-muted-foreground/60 focus:outline-none"
      />
      {#if query.trim()}
        <span
          class="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          {filtered?.length ?? 0} found
        </span>
      {/if}
    </div>

    {#if filtered !== null}
      <!-- Search results -->
      {#if filtered.length > 0}
        <ol class="divide-y divide-border">
          {#each filtered as post, i (post.id)}
            <li>
              <a
                href="/blog/{post.id}"
                class="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-6 md:gap-8 md:py-8"
              >
                <span
                  class="font-mono text-xs text-muted-foreground tabular-nums"
                >
                  N°{String(i + 1).padStart(2, "0")}
                </span>
                <div class="min-w-0 space-y-2">
                  <h3
                    class="text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary md:text-2xl"
                  >
                    {post.title}
                  </h3>
                  {#if post.description}
                    <p
                      class="line-clamp-2 text-sm text-muted-foreground md:text-base"
                    >
                      {post.description}
                    </p>
                  {/if}
                  <div
                    class="pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    <FormattedDate date={post.date} />
                  </div>
                </div>
                <RiArrowRightUpLine
                  class="size-4 shrink-0 text-muted-foreground/60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary md:size-5"
                />
              </a>
            </li>
          {/each}
        </ol>
      {:else}
        <p class="py-16 text-center text-muted-foreground">
          找不到相關文章。
        </p>
      {/if}
    {:else}
      <!-- Year groups -->
      <div class="space-y-16 md:space-y-20">
        {#each data.years as year (year)}
          <section {@attach staggerIn} class="animate">
            <div
              class="mb-4 flex items-baseline justify-between border-t border-border pt-4"
            >
              <h2
                class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                · Year · {year}
              </h2>
              <span
                class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                {data.posts[year].length} entries
              </span>
            </div>
            <ol class="divide-y divide-border">
              {#each data.posts[year] as post, i (post.id)}
                <li>
                  <a
                    href="/blog/{post.id}"
                    class="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-6 md:gap-8 md:py-8"
                  >
                    <span
                      class="font-mono text-xs text-muted-foreground tabular-nums"
                    >
                      N°{String(i + 1).padStart(2, "0")}
                    </span>
                    <div class="min-w-0 space-y-2">
                      <h3
                        class="text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary md:text-2xl"
                      >
                        {post.title}
                      </h3>
                      {#if post.description}
                        <p
                          class="line-clamp-2 text-sm text-muted-foreground md:text-base"
                        >
                          {post.description}
                        </p>
                      {/if}
                      <div
                        class="pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        <FormattedDate date={post.date} />
                      </div>
                    </div>
                    <RiArrowRightUpLine
                      class="size-4 shrink-0 text-muted-foreground/60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary md:size-5"
                    />
                  </a>
                </li>
              {/each}
            </ol>
          </section>
        {/each}
      </div>
    {/if}
  </div>

  <div {@attach staggerIn} class="animate mt-12 flex">
    <BackToTop />
  </div>
</Container>
