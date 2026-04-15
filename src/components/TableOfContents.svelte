<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";

  interface Heading {
    id: string;
    text: string;
    level: number;
  }

  let headings = $state<Heading[]>([]);
  let activeId = $state("");
  let open = $state(false);

  function close() {
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }

  onMount(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3");
    headings = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent ?? "",
      level: parseInt(el.tagName[1]),
    }));

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  });
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if headings.length > 0}
  <!-- Desktop sidebar (xl+) — unchanged -->
  <nav class="hidden xl:block fixed top-32 right-8 w-56 max-h-[calc(100vh-12rem)] overflow-y-auto">
    <div class="text-xs font-semibold text-muted-foreground mb-2">目錄</div>
    <ul class="space-y-1 text-sm border-l border-border">
      {#each headings as heading (heading.id)}
        <li>
          <a
            href={`#${heading.id}`}
            class="block py-0.5 transition-colors duration-200 hover:text-foreground {heading.level === 3
              ? 'pl-6'
              : 'pl-3'} {activeId === heading.id
              ? 'text-foreground border-l-2 border-foreground -ml-px'
              : 'text-muted-foreground'}"
          >
            {heading.text}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Mobile floating button (below xl) -->
  <button
    onclick={() => (open = true)}
    class="xl:hidden fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
    aria-label="開啟目錄"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  </button>

  <!-- Mobile panel (below xl) -->
  {#if open}
    <!-- Backdrop -->
    <div
      class="xl:hidden fixed inset-0 z-40 bg-foreground/40"
      role="presentation"
      onclick={close}
      onkeydown={handleKeydown}
      transition:fade={{ duration: 200 }}
    ></div>

    <!-- Slide-up panel -->
    <nav
      class="xl:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background shadow-2xl"
      aria-label="目錄"
      transition:fly={{ y: 300, duration: 300 }}
    >
      <div class="sticky top-0 flex items-center justify-between border-b border-border bg-background px-5 py-3">
        <span class="text-sm font-semibold text-foreground">目錄</span>
        <button
          onclick={close}
          class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="關閉目錄"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <ul class="space-y-0.5 px-5 py-3 text-sm">
        {#each headings as heading (heading.id)}
          <li>
            <a
              href={`#${heading.id}`}
              onclick={close}
              class="block rounded-md px-3 py-2 transition-colors duration-200 hover:bg-muted hover:text-foreground {heading.level === 3
                ? 'pl-7'
                : 'pl-3'} {activeId === heading.id
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground'}"
            >
              {heading.text}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
{/if}
