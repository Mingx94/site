<script lang="ts">
  interface Props {
    slug: string;
    readingTime: number;
    draft?: boolean;
  }

  let { slug, readingTime, draft = false }: Props = $props();
  let counted = $state(false);
  let visibleSeconds = $state(0);
  let maxScroll = $state(0);
  let readingProgress = $state(0);
  const minSeconds = $derived(Math.max(10, readingTime * 60 * 0.3));

  $effect(() => {
    if (draft) return;
    const timer = setInterval(() => {
      if (!document.hidden) {
        visibleSeconds++;
        void checkAndCount();
      }
    }, 1000);
    return () => clearInterval(timer);
  });

  function handleScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const ratio = window.scrollY / scrollable;
    readingProgress = Math.min(100, ratio * 100);
    maxScroll = Math.max(maxScroll, ratio);
    void checkAndCount();
  }

  async function checkAndCount() {
    if (counted || visibleSeconds < minSeconds || maxScroll < 0.6) return;
    counted = true;
    try {
      await fetch(`/api/blog/${encodeURIComponent(slug)}/views`, { method: "POST" });
    } catch {
      counted = false;
    }
  }
</script>

<svelte:window onscroll={handleScroll} />
<div class="progress-track" aria-hidden="true">
  <div class="progress" style:transform={`scaleX(${readingProgress / 100})`}></div>
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
