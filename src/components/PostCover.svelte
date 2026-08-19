<script module lang="ts">
  const covers = import.meta.glob<{ default: string }>(
    "../content/posts/*/cover.jpg",
    { eager: true, query: { enhanced: true, w: "1600;960;640;400" } },
  );
  const placeholders = import.meta.glob<{ default: string }>(
    "../content/posts/*/cover.jpg",
    { eager: true, query: { enhanced: true, w: "32", blur: "10" } },
  );
</script>

<script lang="ts">
  interface Props {
    slug: string;
    title: string;
    frame?: string;
    ratio?: string;
    priority?: boolean;
    compact?: boolean;
  }

  let {
    slug,
    title,
    frame = "01",
    ratio = "3 / 2",
    priority = false,
    compact = false,
  }: Props = $props();
  let loaded = $state(false);

  const key = $derived(`../content/posts/${slug}/cover.jpg`);
  const image = $derived(covers[key]?.default);
  const placeholder = $derived(placeholders[key]?.default);
</script>

{#if image && placeholder}
  <figure class:compact class="film-frame" style={`--frame-ratio:${ratio}`}>
    <div class="registration top-left" aria-hidden="true"></div>
    <div class="registration top-right" aria-hidden="true"></div>
    <div class="registration bottom-left" aria-hidden="true"></div>
    <div class="registration bottom-right" aria-hidden="true"></div>
    <enhanced:img src={placeholder} alt="" aria-hidden="true" class="image" />
    <enhanced:img
      src={image}
      sizes={compact
        ? "(min-width: 48rem) 240px, 65vw"
        : "(min-width: 80rem) 820px, 100vw"}
      alt={title}
      fetchpriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      onload={() => (loaded = true)}
      class="image full"
      style:opacity={loaded ? 1 : 0}
    />
    <figcaption>
      <span aria-hidden="true">▲</span>
      <span>{frame}</span>
      <span class="selected">Selected frame</span>
    </figcaption>
  </figure>
{/if}

<style>
  .film-frame {
    position: relative;
    aspect-ratio: var(--frame-ratio);
    margin: 0;
    overflow: hidden;
    border: 0.75rem solid var(--film);
    background: var(--film);
    color: var(--film-foreground);
  }
  .image {
    position: absolute;
    inset: 0 0 1.5rem;
    width: 100%;
    height: calc(100% - 1.5rem);
    object-fit: cover;
  }
  .full {
    transition: opacity 650ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  figcaption {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    height: 1.5rem;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    gap: 0.4rem;
    color: var(--film-accent);
    font-family: var(--font-sans);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .selected {
    justify-self: center;
  }
  .registration {
    position: absolute;
    z-index: 2;
    width: 1rem;
    height: 1rem;
    color: var(--film-accent);
    pointer-events: none;
  }
  .registration::before,
  .registration::after {
    position: absolute;
    background: currentColor;
    content: "";
  }
  .registration::before {
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
  }
  .registration::after {
    top: 0;
    left: 50%;
    width: 1px;
    height: 100%;
  }
  .top-left {
    top: -0.45rem;
    left: -0.45rem;
  }
  .top-right {
    top: -0.45rem;
    right: -0.45rem;
  }
  .bottom-left {
    bottom: 1.05rem;
    left: -0.45rem;
  }
  .bottom-right {
    right: -0.45rem;
    bottom: 1.05rem;
  }
  .compact {
    width: 100%;
    min-width: 0;
    border-width: 0.5rem;
  }
  .compact .selected,
  .compact .registration {
    display: none;
  }
  .compact figcaption {
    height: 1.25rem;
  }
  .compact .image {
    bottom: 1.25rem;
    height: calc(100% - 1.25rem);
  }
  @media (width < 40rem) {
    .film-frame {
      border-width: 0.5rem;
    }
    .selected {
      justify-self: end;
    }
  }
</style>
