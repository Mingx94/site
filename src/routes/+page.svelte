<script lang="ts">
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import FormattedDate from "@/components/FormattedDate.svelte";
  import Link from "@/components/Link.svelte";
  import PostCover from "@/components/PostCover.svelte";
  import Seo from "@/components/Seo.svelte";
  import config from "@/config";
  import { staggerIn } from "@/lib/domEvent";
  import RiArrowRightUpLine from "~icons/ri/arrow-right-up-line";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const featured = $derived(data.recentBlogs[0]);

  const elsewhere = [
    { label: "GitHub", href: config.social.github, handle: "Mingx94" },
    {
      label: "LinkedIn",
      href: config.social.linkedin,
      handle: "ming-hsuan-tsai94",
    },
    { label: "Bluesky", href: config.social.bluesky, handle: "vartifact.cc" },
    { label: "X", href: config.social.twitter, handle: "mingx94" },
  ].filter((item) => item.href);
</script>

<Seo />

<Container>
  <div class="home">
    {#if featured}
      <section class="feature" aria-labelledby="feature-title">
        <div {@attach staggerIn} class="animate feature-image">
          <a href="/blog/{featured.id}" aria-label="閱讀：{featured.title}">
            <PostCover
              slug={featured.id}
              title={featured.title}
              frame="01"
              priority
            />
          </a>
        </div>

        <div {@attach staggerIn} class="animate feature-copy">
          <p class="feature-label">Latest writing</p>
          <h1 id="feature-title">
            <a href="/blog/{featured.id}">{featured.title}</a>
          </h1>
          <p class="author">Michael Tsai</p>
          <dl class="feature-meta">
            <div>
              <dt>Frame</dt>
              <dd>01 / {String(data.recentBlogs.length).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd><FormattedDate date={featured.date} /></dd>
            </div>
            {#if featured.readingTime}
              <div>
                <dt>Read</dt>
                <dd>{featured.readingTime} min</dd>
              </div>
            {/if}
          </dl>
          {#if featured.description}
            <p class="feature-description">{featured.description}</p>
          {/if}
        </div>
      </section>

      <section
        {@attach staggerIn}
        class="animate contact-sheet"
        aria-label="文章接觸表"
      >
        <div class="frames">
          {#each data.recentBlogs as post, index (post.id)}
            <a
              href="/blog/{post.id}"
              class="frame"
              aria-label="閱讀：{post.title}"
            >
              <span class="frame-number"
                >{String(index + 1).padStart(2, "0")}</span
              >
              <PostCover
                slug={post.id}
                title={post.title}
                frame={String(index + 1).padStart(2, "0")}
                compact
                ratio="4 / 3"
              />
            </a>
          {/each}
        </div>
        <div class="roll-meta">
          <span>Roll Vartifact</span>
          <span
            >{data.recentBlogs.length} exposed frame{data.recentBlogs.length ===
            1
              ? ""
              : "s"}</span
          >
          <span>Reading room</span>
        </div>
      </section>
    {/if}

    <section
      aria-labelledby="writing"
      {@attach staggerIn}
      class="animate writing"
    >
      <div class="section-head">
        <h2 id="writing">Recent Writing</h2>
        {#if data.showMoreLink}
          <Link href="/blog" underline={false} class="index-link"
            >Full index →</Link
          >
        {/if}
      </div>
      <ol class="post-list">
        {#each data.recentBlogs as post, index (post.id)}
          <li>
            <a href="/blog/{post.id}" class="post-link">
              <span class="post-number"
                >{String(index + 1).padStart(2, "0")}</span
              >
              <div class="post-copy">
                <h3>{post.title}</h3>
                {#if post.description}<p>{post.description}</p>{/if}
              </div>
              <div class="post-meta"><FormattedDate date={post.date} /></div>
              <RiArrowRightUpLine class="post-arrow" />
            </a>
          </li>
        {/each}
      </ol>
    </section>

    {#if elsewhere.length}
      <section
        aria-labelledby="elsewhere"
        {@attach staggerIn}
        class="animate elsewhere"
      >
        <div class="section-head"><h2 id="elsewhere">Elsewhere</h2></div>
        <ul>
          {#each elsewhere as item}
            <li>
              <Link
                href={item.href}
                external
                underline={false}
                class="elsewhere-link"
              >
                <span>{item.label}</span><span class="handle"
                  >{item.handle}</span
                >
              </Link>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  </div>

  <div {@attach staggerIn} class="animate back-top"><BackToTop /></div>
</Container>

<style>
  .home {
    display: flex;
    flex-direction: column;
    gap: clamp(4.5rem, 9vw, 8rem);
    padding-block: 1rem 2rem;
  }
  .feature {
    display: grid;
    align-items: stretch;
    gap: clamp(1.5rem, 4vw, 3rem);
  }
  .feature-image a {
    display: block;
  }
  .feature-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-block: 0.25rem;
  }
  .feature-label,
  dt,
  .frame-number,
  .roll-meta,
  .post-meta {
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .feature-label {
    margin-bottom: 1.25rem;
    color: var(--primary);
  }
  h1,
  h2,
  h3 {
    font-family: var(--font-serif);
    font-weight: 500;
  }
  h1 {
    max-width: 10ch;
    font-size: clamp(3rem, 7vw, 5.75rem);
    line-height: 1.03;
    letter-spacing: -0.035em;
    text-wrap: balance;
  }
  h1 a {
    text-decoration: none;
  }
  h1 a:hover {
    color: var(--primary);
  }
  .author {
    margin-top: 1.5rem;
    font-size: 1.05rem;
    font-weight: 500;
  }
  .feature-meta {
    width: 100%;
    margin-top: 1.5rem;
    border-top: 1px solid var(--border);
  }
  .feature-meta div {
    display: grid;
    grid-template-columns: 5rem 1fr;
    gap: 1rem;
    padding-block: 0.65rem;
    border-bottom: 1px dashed color-mix(in srgb, var(--border) 70%, transparent);
  }
  dt {
    color: var(--muted-foreground);
  }
  dd {
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
  }
  .feature-description {
    max-width: 34rem;
    margin-top: 1.25rem;
    color: var(--muted-foreground);
    font-family: var(--font-serif);
    line-height: 1.75;
  }
  .contact-sheet {
    overflow: hidden;
    padding: 0.7rem;
    background: var(--film);
    color: var(--film-foreground);
  }
  .frames {
    display: flex;
    gap: 0.7rem;
    overflow-x: auto;
    padding-bottom: 0.4rem;
    scrollbar-color: var(--primary) var(--film);
  }
  .frame {
    position: relative;
    display: block;
    min-width: min(72vw, 18rem);
    text-decoration: none;
  }
  .frame-number {
    display: block;
    padding: 0.15rem 0.25rem 0.4rem;
    color: var(--film-accent);
  }
  .frame:hover {
    color: var(--film-accent);
  }
  .roll-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    padding: 0.7rem 0.25rem 0.1rem;
    color: color-mix(in srgb, var(--film-foreground) 75%, transparent);
  }
  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--foreground);
  }
  .section-head h2 {
    font-size: clamp(2rem, 4vw, 3rem);
    letter-spacing: -0.025em;
  }
  :global(.index-link) {
    color: var(--muted-foreground) !important;
    font-size: 0.8rem;
  }
  :global(.index-link:hover) {
    color: var(--primary) !important;
  }
  .post-list li,
  .elsewhere li {
    border-top: 1px solid var(--border);
  }
  .post-link {
    display: grid;
    grid-template-columns: 2.25rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 1rem;
    padding-block: 1.5rem;
    text-decoration: none;
  }
  .post-number {
    color: var(--primary);
    font-variant-numeric: tabular-nums;
  }
  .post-copy h3 {
    font-size: clamp(1.4rem, 3vw, 2rem);
    line-height: 1.25;
  }
  .post-copy p {
    margin-top: 0.4rem;
    color: var(--muted-foreground);
    font-family: var(--font-serif);
    line-height: 1.6;
  }
  .post-meta {
    display: none;
    color: var(--muted-foreground);
  }
  :global(.post-arrow) {
    width: 1.1rem;
    height: 1.1rem;
    transition:
      transform 220ms ease-out,
      color 220ms ease-out;
  }
  .post-link:hover h3,
  .post-link:hover :global(.post-arrow) {
    color: var(--primary);
  }
  .post-link:hover :global(.post-arrow) {
    transform: translate(0.15rem, -0.15rem);
  }
  :global(.elsewhere-link) {
    display: flex !important;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 1rem;
    color: var(--foreground) !important;
    font-family: var(--font-serif);
    text-decoration: none !important;
  }
  :global(.elsewhere-link:hover) {
    color: var(--primary) !important;
  }
  .handle {
    color: var(--muted-foreground);
    font-family: var(--font-sans);
    font-size: 0.8rem;
  }
  .back-top {
    display: flex;
    margin-top: 3rem;
  }
  @media (width >= 52rem) {
    .feature {
      grid-template-columns: minmax(0, 1.65fr) minmax(19rem, 0.8fr);
    }
    .post-link {
      grid-template-columns: 3rem minmax(0, 1fr) auto auto;
      gap: 2rem;
    }
    .post-meta {
      display: block;
    }
    .frame {
      min-width: 15rem;
    }
  }
</style>
