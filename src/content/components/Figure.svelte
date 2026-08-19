<script module lang="ts">
  // Inline article image that goes through `@sveltejs/enhanced-img` for
  // responsive srcset + AVIF/WebP generation — same treatment Cover.svelte
  // gives the post cover, but for arbitrary images dropped next to the
  // article (e.g. `posts/<slug>/diagram.png`).
  //
  // Globs are eager + module-scope so the build pipeline can analyse them
  // statically; enhanced:img requires that. Pattern matches anything under
  // a post directory that isn't `cover.jpg` (covered by Cover.svelte).
  // Paths are relative to this component so Vite can resolve them.
  const images = import.meta.glob<{ default: string }>(
    "../posts/*/*.{jpg,jpeg,png,webp,avif,gif}",
    { eager: true, query: { enhanced: true, w: "1280;800;400" } },
  );

  const placeholders = import.meta.glob<{ default: string }>(
    "../posts/*/*.{jpg,jpeg,png,webp,avif,gif}",
    { eager: true, query: { enhanced: true, w: "32", blur: "10" } },
  );
</script>

<script lang="ts">
  import { page } from "$app/state";

  interface Props {
    src: string;
    alt: string;
    caption?: string;
    slug?: string;
  }

  // `src` is the filename relative to the post directory, e.g. "diagram.png".
  // `slug` is optional — falls back to the current route param so articles
  // on /blog/[slug] don't need to pass it; list/embed views should.
  let { src, alt, caption, slug: slugProp = undefined }: Props = $props();
  let loaded = $state(false);

  const slug = $derived(slugProp ?? page.params.slug);
  const key = $derived(`../posts/${slug}/${src}`);
  const image = $derived(images[key]?.default);
  const placeholder = $derived(placeholders[key]?.default);
</script>

{#if image}
  <figure>
    <div class="frame">
      {#if placeholder}
        <enhanced:img
          src={placeholder}
          alt=""
          aria-hidden="true"
          class="placeholder"
        />
      {/if}
      <enhanced:img
        src={image}
        sizes="(min-width: 1080px) 800px, 100vw"
        {alt}
        onload={() => (loaded = true)}
        class="image"
        style:opacity={loaded ? 1 : 0}
        loading="lazy"
      />
    </div>
    {#if caption}
      <figcaption>
        {caption}
      </figcaption>
    {/if}
  </figure>
{/if}

<style>
  figure {
    margin-block: 1.5rem;
  }
  .frame {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-md);
  }
  .placeholder {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .image {
    position: relative;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 500ms ease-out;
  }
  figcaption {
    margin-top: 0.5rem;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    text-align: center;
  }
</style>
