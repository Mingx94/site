<script lang="ts">
  import Footer from "@/components/Footer.svelte";
  import Header from "@/components/Header.svelte";
  import "@/styles/global.css";
  import config from "@/config";
  import { onMount } from "svelte";
  import { onScroll } from "@/lib/domEvent";
  import { initFont } from "@/lib/font";
  import { initTheme } from "@/lib/theme";
  import TwSizeIndicator from "@/components/TwSizeIndicator.svelte";

  interface Props {
    children: import("svelte").Snippet;
  }

  let { children }: Props = $props();

  onMount(() => {
    initTheme();
    initFont();
    onScroll();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => {
      if (!localStorage.getItem("theme")) {
        initTheme();
      }
    };
    media.addEventListener("change", handleThemeChange);

    return () => {
      media.removeEventListener("change", handleThemeChange);
    };
  });
</script>

<svelte:window onscroll={onScroll} />

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="author" content={config.metadata.meta_author} />

  <!-- Icons -->
  <link rel="icon" type="image/x-icon" href={config.site.favicon} />
  <link
    rel="icon"
    type="image/svg+xml"
    href={config.site.favicon_dark}
    media="(prefers-color-scheme: dark)"
  />
  <link
    rel="icon"
    type="image/svg+xml"
    href={config.site.favicon}
    media="(prefers-color-scheme: light)"
  />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Huninn&display=swap"
  />

  <!-- RSS + Sitemap -->
  <link
    rel="alternate"
    type="application/rss+xml"
    title={config.site.title}
    href="/rss.xml"
  />
  <link rel="sitemap" href="/sitemap.xml" />
</svelte:head>

<Header />
<TwSizeIndicator />
<main>
  {@render children()}
</main>
<Footer />
