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
  let failed = $state(false);

  const key = $derived(`../content/posts/${slug}/cover.jpg`);
  const image = $derived(covers[key]?.default);
  const placeholder = $derived(placeholders[key]?.default);
  const accessibleTitle = $derived(title.trim() || "文章");
</script>

<figure class:compact class="film-frame" style={`--frame-ratio:${ratio}`}>
  <div class="registration top-left" aria-hidden="true"></div>
  <div class="registration top-right" aria-hidden="true"></div>
  <div class="registration bottom-left" aria-hidden="true"></div>
  <div class="registration bottom-right" aria-hidden="true"></div>
  {#if image && placeholder && !failed}
    <enhanced:img src={placeholder} alt="" aria-hidden="true" class="image" />
    <enhanced:img
      src={image}
      sizes={compact
        ? "(min-width: 72rem) 336px, (min-width: 48rem) 240px, (min-width: 40rem) 38vw, 100vw"
        : "(min-width: 80rem) 820px, 100vw"}
      alt={accessibleTitle}
      fetchpriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      onload={() => (loaded = true)}
      onerror={() => (failed = true)}
      class="image full"
      style:opacity={loaded ? 1 : 0}
    />
  {:else}
    <div
      class="missing-image"
      role="img"
      aria-label="{accessibleTitle}：封面圖片暫時無法顯示"
    >
      <span aria-hidden="true">Image unavailable</span>
      <strong aria-hidden="true">{accessibleTitle}</strong>
    </div>
  {/if}
  <figcaption>
    <span aria-hidden="true">▲</span>
    <span>{frame}</span>
    <span class="selected">Selected frame</span>
  </figcaption>
</figure>

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
  .missing-image {
    position: absolute;
    inset: 0 0 1.5rem;
    display: flex;
    min-width: 0;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.75rem;
    overflow: hidden;
    padding: clamp(1rem, 4vw, 2rem);
    background: var(--film);
    color: color-mix(in srgb, var(--film-foreground) 72%, transparent);
  }
  .missing-image span {
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .missing-image strong {
    display: -webkit-box;
    overflow: hidden;
    color: var(--film-foreground);
    font-family: var(--font-serif);
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 500;
    line-height: 1.2;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
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
  .compact .missing-image {
    bottom: 1.25rem;
    gap: 0.4rem;
    padding: clamp(0.65rem, 2vw, 1rem);
  }
  .compact .missing-image strong {
    font-size: 1rem;
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
