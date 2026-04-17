<script lang="ts">
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import FormattedDate from "@/components/FormattedDate.svelte";
  import Link from "@/components/Link.svelte";
  import Seo from "@/components/Seo.svelte";
  import config from "@/config";
  import { staggerIn } from "@/lib/domEvent";
  import RiArrowRightUpLine from "~icons/ri/arrow-right-up-line";

  interface Props {
    data: import("./$types").PageServerData;
  }

  let { data }: Props = $props();

  const year = new Date().getFullYear();

  const elsewhere = [
    { label: "GitHub", href: config.social.github, handle: "Mingx94" },
    { label: "LinkedIn", href: config.social.linkedin, handle: "ming-hsuan-tsai94" },
    { label: "Bluesky", href: config.social.bluesky, handle: "vartifact.cc" },
    { label: "X", href: config.social.twitter, handle: "mingx94" },
  ].filter((i) => i.href);
</script>

<Seo />

<Container>
  <div class="py-8 md:py-12 space-y-24 md:space-y-32">
    <!-- Masthead -->
    <section class="space-y-10 md:space-y-12">
      <div
        {@attach staggerIn}
        class="animate flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <span aria-hidden="true">— Vartifact / N°01</span>
        <span>Anno {year}</span>
      </div>

      <h1
        {@attach staggerIn}
        class="animate font-bold leading-[0.88] tracking-tighter text-foreground"
        style="font-size: clamp(3.25rem, 13vw, 8.5rem);"
      >
        Michael<br />Tsai<span class="text-primary">.</span>
      </h1>

      <div
        {@attach staggerIn}
        class="animate flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <span>前端工程師 &mdash; Taiwan</span>
        <span>Writing · Building · Photographing</span>
      </div>
    </section>

    <!-- Lead paragraph -->
    <section
      {@attach staggerIn}
      class="animate border-t border-border pt-10 md:pt-14"
    >
      <p
        class="max-w-2xl text-2xl md:text-3xl leading-[1.5] tracking-tight text-foreground"
      >
        在 Web 技術與使用者體驗之間來回，把細節磨到發亮。<br class="hidden md:inline" />
        <span class="text-muted-foreground"
          >寫程式、拍照、記錄生活——都是同一種對於形式的追求。</span
        >
      </p>
    </section>

    <!-- Recent writing -->
    <section aria-labelledby="writing" {@attach staggerIn} class="animate">
      <div
        class="flex items-baseline justify-between border-t border-border pt-4 mb-4 md:mb-6"
      >
        <h2
          id="writing"
          class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          · Recent · 最近書寫
        </h2>
        {#if data.showMoreLink}
          <Link
            href="/blog"
            underline={false}
            class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary"
          >
            Index →
          </Link>
        {/if}
      </div>

      <ol class="divide-y divide-border">
        {#each data.recentBlogs as post, i (post.id)}
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
                  class="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  <FormattedDate date={post.date} />
                  {#if post.readingTime}
                    <span aria-hidden="true">·</span>
                    <span>{post.readingTime} min read</span>
                  {/if}
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

    <!-- Elsewhere -->
    {#if elsewhere.length}
      <section aria-labelledby="elsewhere" {@attach staggerIn} class="animate">
        <div class="border-t border-border pt-4 mb-4 md:mb-6">
          <h2
            id="elsewhere"
            class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            · Elsewhere · 其他地方
          </h2>
        </div>
        <ul class="divide-y divide-border">
          {#each elsewhere as link}
            <li>
              <Link
                href={link.href}
                external
                underline={false}
                class="group flex items-baseline justify-between py-4 !text-foreground"
              >
                <span
                  class="text-lg font-medium transition-colors group-hover:text-primary"
                >
                  {link.label}
                </span>
                <span class="flex items-center gap-3">
                  <span
                    class="hidden font-mono text-xs text-muted-foreground sm:inline"
                    >/ {link.handle}</span
                  >
                  <RiArrowRightUpLine
                    class="size-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </span>
              </Link>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <!-- Colophon -->
    <section {@attach staggerIn} class="animate">
      <div
        class="flex flex-wrap items-baseline justify-between gap-y-2 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <span>Set in Schibsted Grotesk &amp; Huninn</span>
        <span>Built with SvelteKit</span>
      </div>
    </section>
  </div>

  <div {@attach staggerIn} class="animate mt-16 flex">
    <BackToTop />
  </div>
</Container>
