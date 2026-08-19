<script lang="ts">
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import FormattedDate from "@/components/FormattedDate.svelte";
  import Link from "@/components/Link.svelte";
  import Seo from "@/components/Seo.svelte";
  import config from "@/config";
  import { staggerIn } from "@/lib/domEvent";
  import RiArrowRightUpLine from "~icons/ri/arrow-right-up-line";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const year = new Date().getFullYear();

  const elsewhere = [
    { label: "GitHub", href: config.social.github, handle: "Mingx94" },
    {
      label: "LinkedIn",
      href: config.social.linkedin,
      handle: "ming-hsuan-tsai94",
    },
    { label: "Bluesky", href: config.social.bluesky, handle: "vartifact.cc" },
    { label: "X", href: config.social.twitter, handle: "mingx94" },
  ].filter((i) => i.href);
</script>

<Seo />

<Container>
  <div class="home">
    <!-- Masthead -->
    <section class="masthead">
      <div {@attach staggerIn} class="animate eyebrow split">
        <span aria-hidden="true">— Vartifact / N°01</span>
        <span>Anno {year}</span>
      </div>

      <h1
        {@attach staggerIn}
        class="animate title"
        style="font-size: clamp(3.25rem, 13vw, 8.5rem);"
      >
        Michael<br />Tsai<span class="accent">.</span>
      </h1>

      <div {@attach staggerIn} class="animate eyebrow intro-meta">
        <span>前端工程師 &mdash; Taiwan</span>
        <span>Writing · Building · Photographing</span>
      </div>
    </section>

    <!-- Lead paragraph -->
    <section {@attach staggerIn} class="animate lead">
      <p class="lead-copy">
        在 Web 技術與使用者體驗之間來回，把細節磨到發亮。<br
          class="desktop-break"
        />
        <span class="muted"
          >寫程式、拍照、記錄生活——都是同一種對於形式的追求。</span
        >
      </p>
    </section>

    <!-- Recent writing -->
    <section aria-labelledby="writing" {@attach staggerIn} class="animate">
      <div class="section-head">
        <h2 id="writing" class="eyebrow">· Recent · 最近書寫</h2>
        {#if data.showMoreLink}
          <Link href="/blog" underline={false} class="index-link eyebrow">
            Index →
          </Link>
        {/if}
      </div>

      <ol class="post-list">
        {#each data.recentBlogs as post, i (post.id)}
          <li>
            <a href="/blog/{post.id}" class="post-link">
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
                  {#if post.readingTime}
                    <span aria-hidden="true">·</span>
                    <span>{post.readingTime} min read</span>
                  {/if}
                </div>
              </div>
              <RiArrowRightUpLine class="post-arrow" />
            </a>
          </li>
        {/each}
      </ol>
    </section>

    <!-- Elsewhere -->
    {#if elsewhere.length}
      <section aria-labelledby="elsewhere" {@attach staggerIn} class="animate">
        <div class="section-head">
          <h2 id="elsewhere" class="eyebrow">· Elsewhere · 其他地方</h2>
        </div>
        <ul class="elsewhere-list">
          {#each elsewhere as link}
            <li>
              <Link
                href={link.href}
                external
                underline={false}
                class="elsewhere-link"
              >
                <span class="elsewhere-label">
                  {link.label}
                </span>
                <span class="elsewhere-meta">
                  <span class="handle">/ {link.handle}</span>
                  <RiArrowRightUpLine class="elsewhere-arrow" />
                </span>
              </Link>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <!-- Colophon -->
    <section {@attach staggerIn} class="animate">
      <div class="colophon">
        <span>Set in Schibsted Grotesk &amp; Huninn</span>
        <span>Built with SvelteKit</span>
      </div>
    </section>
  </div>

  <div {@attach staggerIn} class="animate back-top">
    <BackToTop />
  </div>
</Container>

<style>
  .home {
    padding-block: 2rem;
  }
  .home,
  .masthead {
    display: flex;
    flex-direction: column;
  }
  .home {
    gap: 6rem;
  }
  .masthead {
    gap: 2.5rem;
  }
  .eyebrow {
    color: var(--muted-foreground);
    font: 11px var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .split {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .title {
    color: var(--foreground);
    font-size: clamp(3.25rem, 13vw, 8.5rem);
    font-weight: 700;
    letter-spacing: -0.05em;
    line-height: 0.88;
  }
  .accent {
    color: var(--primary);
  }
  .intro-meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .lead {
    padding-top: 2.5rem;
    border-top: 1px solid var(--border);
  }
  .lead-copy {
    max-width: 42rem;
    color: var(--foreground);
    font-size: 1.5rem;
    letter-spacing: -0.025em;
    line-height: 1.5;
  }
  .muted {
    color: var(--muted-foreground);
  }
  .desktop-break {
    display: none;
  }
  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }
  :global(.index-link:hover) {
    color: var(--primary) !important;
  }
  .post-list li,
  .elsewhere-list li {
    border-top: 1px solid var(--border);
  }
  .post-list li:first-child,
  .elsewhere-list li:first-child {
    border-top: 0;
  }
  .post-link {
    display: grid;
    grid-template-columns: 2.5rem 1fr auto;
    align-items: baseline;
    gap: 1rem;
    padding-block: 1.5rem;
  }
  .post-number {
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
    font-weight: 600;
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
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.75rem;
    padding-top: 0.25rem;
    color: var(--muted-foreground);
    font: 10px var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  :global(.post-arrow),
  :global(.elsewhere-arrow) {
    width: 1rem;
    height: 1rem;
    color: color-mix(in oklch, var(--muted-foreground) 60%, transparent);
    transition:
      transform 300ms,
      color 300ms;
  }
  .post-link:hover :global(.post-arrow),
  :global(.elsewhere-link:hover .elsewhere-arrow) {
    color: var(--primary);
    transform: translate(0.125rem, -0.125rem);
  }
  :global(.elsewhere-link) {
    display: flex !important;
    align-items: baseline;
    justify-content: space-between;
    padding-block: 1rem;
    color: var(--foreground) !important;
  }
  .elsewhere-label {
    font-size: 1.125rem;
    font-weight: 500;
    transition: color 300ms;
  }
  :global(.elsewhere-link:hover) .elsewhere-label {
    color: var(--primary);
  }
  .elsewhere-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .handle {
    display: none;
    color: var(--muted-foreground);
    font: 12px var(--font-mono);
  }
  .colophon {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    row-gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    color: var(--muted-foreground);
    font: 10px var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .back-top {
    display: flex;
    margin-top: 4rem;
  }
  @media (width >= 40rem) {
    .intro-meta {
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;
    }
    .handle {
      display: inline;
    }
  }
  @media (width >= 48rem) {
    .home {
      gap: 8rem;
      padding-block: 3rem;
    }
    .masthead {
      gap: 3rem;
    }
    .lead {
      padding-top: 3.5rem;
    }
    .lead-copy {
      font-size: 1.875rem;
    }
    .desktop-break {
      display: inline;
    }
    .section-head {
      margin-bottom: 1.5rem;
    }
    .post-link {
      gap: 2rem;
      padding-block: 2rem;
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
  }
</style>
