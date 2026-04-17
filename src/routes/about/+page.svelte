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
  <div class="pt-4 md:pt-8 pb-8 space-y-16 md:space-y-20">
    <!-- Masthead strip -->
    <div
      {@attach staggerIn}
      class="animate flex items-baseline justify-between gap-4 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
    >
      <span>· Colophon · About</span>
      <span>N°02</span>
    </div>

    <!-- Title block -->
    <div class="space-y-6 -mt-10 md:-mt-14">
      <h1
        {@attach staggerIn}
        class="animate font-bold leading-[0.95] tracking-tighter text-foreground"
        style="font-size: clamp(3rem, 10vw, 6rem);"
      >
        關於<span class="text-primary">.</span>
      </h1>

      <p
        {@attach staggerIn}
        class="animate max-w-2xl text-xl md:text-2xl leading-relaxed text-foreground"
      >
        我是 Michael Tsai<span class="text-primary">.</span>
        <span class="text-muted-foreground">
          前端工程師，在台灣工作。
          對效能、無障礙設計與細節有持續的關注，
          也在用程式碼以外的方式觀察世界。
        </span>
      </p>
    </div>

    <!-- Facts table -->
    <section {@attach staggerIn} class="animate">
      <dl class="divide-y divide-border border-y border-border">
        {#each facts as { label, value }}
          <div
            class="grid grid-cols-[7rem_1fr] items-baseline gap-6 py-4 md:grid-cols-[10rem_1fr]"
          >
            <dt
              class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              {label}
            </dt>
            <dd class="text-base md:text-lg text-foreground">{value}</dd>
          </div>
        {/each}
      </dl>
    </section>

    <!-- Narrative -->
    <section {@attach staggerIn} class="animate space-y-10">
      <div
        class="flex items-baseline justify-between border-t border-border pt-4"
      >
        <h2
          class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          · Notes
        </h2>
      </div>

      <div class="space-y-6 max-w-2xl text-base md:text-lg leading-[1.8] text-foreground">
        <p>
          工作上主要使用 React 與 Next.js 開發 Web 應用，
          對效能優化、無障礙設計與使用者體驗有持續的關注。
          這個部落格本身是用 SvelteKit 打造的——
          邊探索邊實作，把新框架當作素材來思考。
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
        <div class="border-t border-border pt-4 mb-4 md:mb-6">
          <h2
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

    <!-- Contact CTA -->
    <section {@attach staggerIn} class="animate">
      <div
        class="flex flex-wrap items-baseline justify-between gap-y-3 border-t border-border pt-4"
      >
        <span
          class="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          · Say Hi
        </span>
        <Link
          href="/contact"
          underline={false}
          class="group inline-flex items-baseline gap-2 text-lg font-medium !text-foreground hover:!text-primary"
        >
          寄封信給我
          <RiArrowRightUpLine
            class="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  </div>

  <div {@attach staggerIn} class="animate mt-8 flex">
    <BackToPrev />
    <BackToTop />
  </div>
</Container>
