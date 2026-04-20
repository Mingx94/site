<script lang="ts">
  import { page } from "$app/state";
  import config from "@/config";

  interface Props {
    title?: string;
    description?: string;
    og?: string;
    noindex?: boolean;
  }

  let { title, description, og, noindex = false }: Props = $props();

  const finalTitle = $derived(title ?? config.site.title);
  const finalDescription = $derived(
    description ?? config.metadata.meta_description,
  );
  const finalOg = $derived(og ?? "/og.jpg");
  const fullPageUrl = $derived(page.url.href);
  const fullOgUrl = $derived(
    finalOg.startsWith("http") ? finalOg : new URL(finalOg, page.url).href,
  );
  // Canonical URL — origin + pathname only, drops query strings & fragment
  // so variants like ?ref=… don't register as duplicate content.
  const canonicalUrl = $derived(page.url.origin + page.url.pathname);
</script>

<svelte:head>
  <title>{finalTitle}</title>
  <meta name="description" content={finalDescription} />
  <link rel="canonical" href={canonicalUrl} />
  {#if noindex}
    <meta name="robots" content="noindex,nofollow" />
  {/if}

  <meta property="og:type" content="website" />
  <meta property="og:title" content={finalTitle} />
  <meta property="og:url" content={fullPageUrl} />
  <meta property="og:image" content={fullOgUrl} />
  <meta property="og:description" content={finalDescription} />
  <meta property="og:site_name" content={config.site.title} />
  <meta property="article:author" content={config.metadata.meta_author} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:creator" content={config.metadata.meta_author} />
  <meta name="twitter:title" content={finalTitle} />
  <meta name="twitter:description" content={finalDescription} />
  <meta name="twitter:image" content={fullOgUrl} />
</svelte:head>
