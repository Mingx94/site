<script lang="ts">
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import FormattedDate from "@/components/FormattedDate.svelte";
  import PostCover from "@/components/PostCover.svelte";
  import Seo from "@/components/Seo.svelte";
  import { staggerIn } from "@/lib/domEvent";
  import type { Post } from "@/lib/posts";
  import RiArrowRightUpLine from "~icons/ri/arrow-right-up-line";
  import RiSearchLine from "~icons/ri/search-line";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

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

<Seo
  title="文章 | Vartifact"
  description="技術隨筆、閱讀筆記，以及其他片段。"
/>

<Container>
  <div class="archive">
    <!-- Masthead strip -->
    <div {@attach staggerIn} class="animate strip">
      <span>· Archive · Writing</span>
      <span>{String(total).padStart(2, "0")} entries</span>
    </div>

    <!-- Title block -->
    <div class="title-block">
      <h1
        {@attach staggerIn}
        class="animate page-title"
        style="font-size: clamp(3rem, 10vw, 6rem);"
      >
        文章<span class="accent">.</span>
      </h1>

      <p {@attach staggerIn} class="animate introduction">
        技術隨筆、閱讀筆記，以及其他片段——<br class="desktop-break" />
        這裡是我把想清楚的東西寫下來的地方。
      </p>
    </div>

    <!-- Search -->
    <div {@attach staggerIn} class="animate search">
      <RiSearchLine class="search-icon" />
      <label for="blog-search" class="visually-hidden">搜尋文章</label>
      <input
        id="blog-search"
        type="search"
        bind:value={query}
        placeholder="搜尋..."
        class="search-input"
      />
      {#if query.trim()}
        <span class="result-count">
          {filtered?.length ?? 0} found
        </span>
      {/if}
    </div>

    {#if filtered !== null}
      <!-- Search results -->
      {#if filtered.length > 0}
        <ol class="post-list">
          {#each filtered as post, i (post.id)}
            <li>
              <a href="/blog/{post.id}" class="post-link">
                <div class="post-cover">
                  <PostCover
                    slug={post.id}
                    title={post.title}
                    frame={String(i + 1).padStart(2, "0")}
                    compact
                    ratio="4 / 3"
                  />
                </div>
                <span class="post-number">
                  N°{String(i + 1).padStart(2, "0")}
                </span>
                <div class="post-copy">
                  <h3 class="post-title">
                    {post.title}
                  </h3>
                  {#if post.description}
                    <p class="post-description">
                      {post.description}
                    </p>
                  {/if}
                  <div class="post-meta">
                    <FormattedDate date={post.date} />
                  </div>
                </div>
                <RiArrowRightUpLine class="post-arrow" />
              </a>
            </li>
          {/each}
        </ol>
      {:else}
        <p class="empty">找不到相關文章。</p>
      {/if}
    {:else}
      <!-- Year groups -->
      <div class="years">
        {#each data.years as year (year)}
          <section {@attach staggerIn} class="animate">
            <div class="year-head">
              <h2 class="eyebrow">
                · Year · {year}
              </h2>
              <span class="count">
                {data.posts[year].length} entries
              </span>
            </div>
            <ol class="post-list">
              {#each data.posts[year] as post, i (post.id)}
                <li>
                  <a href="/blog/{post.id}" class="post-link">
                    <div class="post-cover">
                      <PostCover
                        slug={post.id}
                        title={post.title}
                        frame={String(i + 1).padStart(2, "0")}
                        compact
                        ratio="4 / 3"
                      />
                    </div>
                    <span class="post-number">
                      N°{String(i + 1).padStart(2, "0")}
                    </span>
                    <div class="post-copy">
                      <h3 class="post-title">
                        {post.title}
                      </h3>
                      {#if post.description}
                        <p class="post-description">
                          {post.description}
                        </p>
                      {/if}
                      <div class="post-meta">
                        <FormattedDate date={post.date} />
                      </div>
                    </div>
                    <RiArrowRightUpLine class="post-arrow" />
                  </a>
                </li>
              {/each}
            </ol>
          </section>
        {/each}
      </div>
    {/if}
  </div>

  <div {@attach staggerIn} class="animate back-top">
    <BackToTop />
  </div>
</Container>

<style>
  .archive {
    padding-block: 1rem 2rem;
  }
  .strip,
  .year-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .strip {
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    color: var(--muted-foreground);
    font: 11px var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .title-block {
    margin-block: 2rem 2.5rem;
  }
  .title-block > * + * {
    margin-top: 1.5rem;
  }
  .page-title {
    color: var(--foreground);
    font-size: clamp(3rem, 10vw, 6rem);
    font-family: var(--font-serif);
    font-weight: 500;
    letter-spacing: -0.035em;
    line-height: 0.95;
  }
  .accent {
    color: var(--primary);
  }
  .introduction {
    max-width: 42rem;
    color: var(--muted-foreground);
    font-size: 1.125rem;
    line-height: 1.625;
  }
  .desktop-break {
    display: none;
  }
  .search {
    position: relative;
    margin-bottom: 2.5rem;
    border-block: 1px solid var(--border);
  }
  :global(.search-icon) {
    position: absolute;
    top: 50%;
    left: 0;
    width: 1rem;
    height: 1rem;
    color: var(--muted-foreground);
    transform: translateY(-50%);
    pointer-events: none;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .search-input {
    width: 100%;
    padding: 1rem 1rem 1rem 1.75rem;
    background: transparent;
    font-size: 1rem;
    outline: none;
  }
  .search-input::placeholder {
    color: color-mix(in oklch, var(--muted-foreground) 60%, transparent);
  }
  .result-count {
    position: absolute;
    top: 50%;
    right: 0;
    color: var(--muted-foreground);
    font: 10px var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    transform: translateY(-50%);
  }
  .post-list li {
    border-top: 1px solid var(--border);
  }
  .post-list li:first-child {
    border-top: 0;
  }
  .post-link {
    display: grid;
    grid-template-columns: 5rem minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 1rem;
    padding-block: 1.5rem;
  }
  .post-number {
    display: none;
    color: var(--muted-foreground);
    font: 12px var(--font-mono);
    font-variant-numeric: tabular-nums;
  }
  .post-copy {
    min-width: 0;
  }
  .post-copy > * + * {
    margin-top: 0.5rem;
  }
  .post-title {
    color: var(--foreground);
    font-size: 1.25rem;
    font-family: var(--font-serif);
    font-weight: 500;
    line-height: 1.375;
    transition: color 300ms;
  }
  .post-link:hover .post-title {
    color: var(--primary);
  }
  .post-description {
    display: -webkit-box;
    overflow: hidden;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  .post-meta {
    padding-top: 0.25rem;
    color: var(--muted-foreground);
    font: 10px var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  :global(.post-arrow) {
    width: 1rem;
    height: 1rem;
    color: color-mix(in oklch, var(--muted-foreground) 60%, transparent);
    transition:
      transform 300ms,
      color 300ms;
  }
  .post-link:hover :global(.post-arrow) {
    color: var(--primary);
    transform: translate(0.125rem, -0.125rem);
  }
  .empty {
    padding-block: 4rem;
    color: var(--muted-foreground);
    text-align: center;
  }
  .years {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
  .year-head {
    margin-bottom: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }
  .eyebrow,
  .count {
    color: var(--muted-foreground);
    font-family: var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .eyebrow {
    font-size: 11px;
  }
  .count {
    font-size: 10px;
  }
  .back-top {
    display: flex;
    margin-top: 3rem;
  }
  @media (width >= 48rem) {
    .archive {
      padding-top: 2rem;
    }
    .title-block {
      margin-block: 3rem 3.5rem;
    }
    .introduction {
      font-size: 1.25rem;
    }
    .desktop-break {
      display: inline;
    }
    .search {
      margin-bottom: 3.5rem;
    }
    .post-link {
      grid-template-columns: minmax(11rem, 15rem) 2.5rem minmax(0, 1fr) auto;
      gap: 2rem;
      padding-block: 2rem;
    }
    .post-number {
      display: block;
    }
    .post-title {
      font-size: 1.5rem;
    }
    .post-description {
      font-size: 1rem;
    }
    :global(.post-arrow) {
      width: 1.25rem;
      height: 1.25rem;
    }
    .years {
      gap: 5rem;
    }
  }
</style>
