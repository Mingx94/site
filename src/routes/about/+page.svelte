<script lang="ts">
  import BackToPrev from "@/components/BackToPrev.svelte";
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import Link from "@/components/Link.svelte";
  import Seo from "@/components/Seo.svelte";
  import config from "@/config";
  import { staggerIn } from "@/lib/domEvent";
  import RiArrowRightUpLine from "~icons/ri/arrow-right-up-line";

  const elsewhere = [
    {
      label: "GitHub",
      href: config.social.github,
      handle: "Mingx94",
    },
    {
      label: "LinkedIn",
      href: config.social.linkedin,
      handle: "ming-hsuan-tsai94",
    },
    {
      label: "Bluesky",
      href: config.social.bluesky,
      handle: "vartifact.cc",
    },
    {
      label: "X",
      href: config.social.twitter,
      handle: "mingx94",
    },
  ].filter((i) => i.href);

  const facts = [
    { label: "Role", value: "前端工程師" },
    { label: "Location", value: "Taiwan" },
    { label: "Stack", value: "React · Next.js · Svelte" },
    { label: "Also", value: "攝影、閱讀" },
  ];
</script>

<Seo
  title="關於 | Vartifact"
  description="關於 Michael Tsai — 前端工程師，Vartifact 部落格的作者。"
/>

<Container>
  <div class="about">
    <!-- Masthead strip -->
    <div {@attach staggerIn} class="animate strip">
      <span>· Colophon · About</span>
      <span>N°02</span>
    </div>

    <!-- Title block -->
    <div class="title-block">
      <h1
        {@attach staggerIn}
        class="animate page-title"
        style="font-size: clamp(3rem, 10vw, 6rem);"
      >
        關於<span class="accent">.</span>
      </h1>

      <p {@attach staggerIn} class="animate introduction">
        我是 Michael Tsai<span class="accent">.</span>
        <span class="muted">
          前端工程師，在台灣工作。 對效能、無障礙設計與細節有持續的關注，
          也在用程式碼以外的方式觀察世界。
        </span>
      </p>
    </div>

    <!-- Facts table -->
    <section {@attach staggerIn} class="animate">
      <dl class="facts">
        {#each facts as { label, value }}
          <div class="fact">
            <dt class="eyebrow">
              {label}
            </dt>
            <dd>{value}</dd>
          </div>
        {/each}
      </dl>
    </section>

    <!-- Narrative -->
    <section {@attach staggerIn} class="animate narrative">
      <div class="section-head">
        <h2 class="eyebrow">· Notes</h2>
      </div>

      <div class="prose">
        <p>
          工作上主要使用 React 與 Next.js 開發 Web 應用，
          對效能優化、無障礙設計與使用者體驗有持續的關注。 這個部落格本身是用
          SvelteKit 打造的—— 邊探索邊實作，把新框架當作素材來思考。
        </p>
        <p>
          出門一定帶相機。部落格裡的圖片幾乎都是自己拍的。
          拍攝對我來說是一種思考方式，
          構圖和寫程式有點像——都在尋找最精簡、最有力量的表達。
        </p>
      </div>
    </section>

    <!-- Elsewhere -->
    {#if elsewhere.length}
      <section {@attach staggerIn} class="animate">
        <div class="section-head elsewhere-head">
          <h2 class="eyebrow">· Elsewhere · 其他地方</h2>
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
                  <RiArrowRightUpLine class="arrow" />
                </span>
              </Link>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <!-- Contact CTA -->
    <section {@attach staggerIn} class="animate">
      <div class="contact-row">
        <span class="eyebrow"> · Say Hi </span>
        <Link href="/contact" underline={false} class="contact-link">
          寄封信給我
          <RiArrowRightUpLine class="arrow" />
        </Link>
      </div>
    </section>
  </div>

  <div {@attach staggerIn} class="animate back-links">
    <BackToPrev />
    <BackToTop />
  </div>
</Container>

<style>
  .about {
    display: flex;
    flex-direction: column;
    gap: 4rem;
    padding-block: 1rem 2rem;
  }
  .strip,
  .section-head,
  .contact-row {
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
    margin-top: -2.5rem;
  }
  .title-block > * + * {
    margin-top: 1.5rem;
  }
  .page-title {
    color: var(--foreground);
    font-size: clamp(3rem, 10vw, 6rem);
    font-weight: 700;
    letter-spacing: -0.05em;
    line-height: 0.95;
  }
  .accent {
    color: var(--primary);
  }
  .introduction {
    max-width: 42rem;
    color: var(--foreground);
    font-size: 1.25rem;
    line-height: 1.625;
  }
  .muted {
    color: var(--muted-foreground);
  }
  .facts {
    border-block: 1px solid var(--border);
  }
  .fact {
    display: grid;
    grid-template-columns: 7rem 1fr;
    align-items: baseline;
    gap: 1.5rem;
    padding-block: 1rem;
    border-top: 1px solid var(--border);
  }
  .fact:first-child {
    border-top: 0;
  }
  .eyebrow {
    color: var(--muted-foreground);
    font: 11px var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  dd {
    color: var(--foreground);
  }
  .narrative {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }
  .section-head,
  .contact-row {
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }
  .prose {
    max-width: 42rem;
    color: var(--foreground);
    line-height: 1.8;
  }
  .prose > * + * {
    margin-top: 1.5rem;
  }
  .elsewhere-head {
    margin-bottom: 1rem;
  }
  .elsewhere-list li {
    border-top: 1px solid var(--border);
  }
  .elsewhere-list li:first-child {
    border-top: 0;
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
  :global(.arrow) {
    width: 1rem;
    height: 1rem;
    transition:
      transform 300ms,
      color 300ms;
  }
  :global(.elsewhere-link .arrow) {
    color: var(--muted-foreground);
  }
  :global(.elsewhere-link:hover .arrow),
  :global(.contact-link:hover .arrow) {
    color: var(--primary);
    transform: translate(0.125rem, -0.125rem);
  }
  .contact-row {
    flex-wrap: wrap;
    row-gap: 0.75rem;
  }
  :global(.contact-link) {
    display: inline-flex !important;
    align-items: baseline;
    gap: 0.5rem;
    color: var(--foreground) !important;
    font-size: 1.125rem;
    font-weight: 500;
  }
  :global(.contact-link:hover) {
    color: var(--primary) !important;
  }
  .back-links {
    display: flex;
    margin-top: 2rem;
  }
  @media (width >= 40rem) {
    .handle {
      display: inline;
    }
  }
  @media (width >= 48rem) {
    .about {
      gap: 5rem;
      padding-top: 2rem;
    }
    .title-block {
      margin-top: -3.5rem;
    }
    .introduction {
      font-size: 1.5rem;
    }
    .fact {
      grid-template-columns: 10rem 1fr;
    }
    dd,
    .prose {
      font-size: 1.125rem;
    }
    .elsewhere-head {
      margin-bottom: 1.5rem;
    }
  }
</style>
