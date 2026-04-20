<script module>
  // Inline article image that goes through `@sveltejs/enhanced-img` for
  // responsive srcset + AVIF/WebP generation — same treatment Cover.svelte
  // gives the post cover, but for arbitrary images dropped next to the
  // article (e.g. `posts/<slug>/diagram.png`).
  //
  // Globs are eager + module-scope so the build pipeline can analyse them
  // statically; enhanced:img requires that. Pattern matches anything under
  // a post directory that isn't `cover.jpg` (covered by Cover.svelte).
  // Path is relative to this component so it resolves under both the site
  // and editor Vite roots.
  const images = import.meta.glob(
    "../posts/*/*.{jpg,jpeg,png,webp,avif,gif}",
    { eager: true, query: { enhanced: true, w: "1280;800;400" } },
  );

  const placeholders = import.meta.glob(
    "../posts/*/*.{jpg,jpeg,png,webp,avif,gif}",
    { eager: true, query: { enhanced: true, w: "32", blur: "10" } },
  );
</script>

<script>
  import { page } from "$app/state";

  // `src` is the filename relative to the post directory, e.g. "diagram.png".
  // `slug` is optional — falls back to the current route param so articles
  // on /blog/[slug] don't need to pass it; list/embed views should.
  let { src, alt, caption, slug: slugProp = undefined } = $props();
  let loaded = $state(false);

  const slug = $derived(slugProp ?? page.params.slug);
  const key = $derived(`../posts/${slug}/${src}`);
  const image = $derived(images[key]?.default);
  const placeholder = $derived(placeholders[key]?.default);
</script>

{#if image}
  <figure class="my-6">
    <div class="relative overflow-hidden rounded-md">
      {#if placeholder}
        <enhanced:img
          src={placeholder}
          alt=""
          aria-hidden="true"
          class="absolute inset-0 h-full w-full object-cover"
        />
      {/if}
      <enhanced:img
        src={image}
        sizes="(min-width: 1080px) 800px, 100vw"
        {alt}
        onload={() => (loaded = true)}
        class="relative h-full w-full object-cover transition-opacity duration-500 ease-out"
        style:opacity={loaded ? 1 : 0}
        loading="lazy"
      />
    </div>
    {#if caption}
      <figcaption class="mt-2 text-sm text-muted-foreground text-center">
        {caption}
      </figcaption>
    {/if}
  </figure>
{:else}
  <!-- Fallback for the editor preview where enhanced-img may not resolve
       a freshly-added image: plain <img> via the content API so authors
       see something immediately after dropping a file in. -->
  <figure class="my-6">
    <img
      src="/__editor/file?path=posts/{slug}/{src}"
      {alt}
      class="w-full rounded-md"
      loading="lazy"
    />
    {#if caption}
      <figcaption class="mt-2 text-sm text-muted-foreground text-center">
        {caption}
      </figcaption>
    {/if}
  </figure>
{/if}
