<script lang="ts">
  interface Props {
    slug: string;
    readingTime: number;
    draft?: boolean;
  }

  let { slug, readingTime, draft = false }: Props = $props();
</script>

<div
  class="progress-track"
  aria-hidden="true"
  data-article-progress
  data-slug={slug}
  data-min-seconds={Math.max(10, readingTime * 60 * 0.3)}
  data-draft={draft}
>
  <div class="progress"></div>
</div>

<style>
  .progress-track {
    position: fixed;
    z-index: 51;
    inset: 0 0 auto;
    height: 0.125rem;
    background: color-mix(in oklch, var(--border) 50%, transparent);
  }
  .progress {
    height: 100%;
    background: var(--primary);
    transform-origin: left;
    transition: transform 75ms linear;
  }
</style>
