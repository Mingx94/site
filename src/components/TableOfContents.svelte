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
  <!-- Desktop sidebar (2xl+) — left-anchored to container right edge -->
  <nav class="desktop-toc" aria-label="文章目錄">
    <div class="toc-title">目錄</div>
    <ul class="toc-list">
      {#each headings as heading (heading.id)}
        <li>
          <a
            href={`#${heading.id}`}
            aria-current={activeId === heading.id ? "location" : undefined}
            class="toc-link"
            class:subsection={heading.level === 3}
            class:active={activeId === heading.id}
          >
            {heading.text}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Mobile floating button (below 2xl) -->
  <button
    onclick={() => (open = true)}
    class="toc-toggle"
    aria-label="開啟目錄"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  </button>

  <!-- Mobile panel (below 2xl) -->
  {#if open}
    <!-- Backdrop -->
    <div
      class="backdrop"
      role="presentation"
      onclick={close}
      onkeydown={handleKeydown}
      transition:fade={{ duration: 200 }}
    ></div>

    <!-- Slide-up panel -->
    <nav
      class="mobile-toc"
      aria-label="目錄"
      transition:fly={{ y: 300, duration: 300 }}
    >
      <div class="mobile-head">
        <span>目錄</span>
        <button onclick={close} class="close" aria-label="關閉目錄">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <ul class="mobile-list">
        {#each headings as heading (heading.id)}
          <li>
            <a
              href={`#${heading.id}`}
              onclick={close}
              class="mobile-link"
              class:subsection={heading.level === 3}
              class:active={activeId === heading.id}
            >
              {heading.text}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
{/if}

<style>
  .desktop-toc {
    display: none;
  }
  .toc-title {
    margin-bottom: 0.5rem;
    color: var(--muted-foreground);
    font-size: 0.6875rem;
    font-weight: 600;
  }
  .toc-list {
    border-left: 1px solid var(--border);
    font-size: 0.875rem;
  }
  .toc-list li + li {
    margin-top: 0.25rem;
  }
  .toc-link {
    display: block;
    padding: 0.125rem 0 0.125rem 0.75rem;
    color: var(--muted-foreground);
    transition: color 200ms;
  }
  .toc-link:hover,
  .toc-link.active {
    color: var(--foreground);
  }
  .toc-link.subsection {
    padding-left: 1.5rem;
  }
  .toc-link.active {
    margin-left: -1px;
    border-left: 2px solid var(--foreground);
  }
  .toc-toggle {
    position: fixed;
    z-index: 40;
    right: max(1rem, env(safe-area-inset-right));
    bottom: max(1rem, env(safe-area-inset-bottom));
    display: flex;
    width: 3rem;
    height: 3rem;
    align-items: center;
    justify-content: center;
    color: var(--primary-foreground);
    border-radius: 999px;
    background: var(--primary);
    box-shadow: var(--shadow-contact);
    transition: transform 200ms;
  }
  .toc-toggle:hover {
    transform: scale(1.05);
  }
  .toc-toggle:active {
    transform: scale(0.95);
  }
  .backdrop {
    position: fixed;
    z-index: 40;
    inset: 0;
    background: color-mix(in oklch, var(--foreground) 40%, transparent);
  }
  .mobile-toc {
    position: fixed;
    z-index: 50;
    right: 0;
    bottom: 0;
    left: 0;
    max-height: 70vh;
    overflow-y: auto;
    border-top: 1px solid var(--border);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    background: var(--background);
    box-shadow: var(--shadow-overlay);
  }
  .mobile-head {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    color: var(--foreground);
    border-bottom: 1px solid var(--border);
    background: var(--background);
    font-size: 0.875rem;
    font-weight: 600;
  }
  .close {
    display: flex;
    width: 2rem;
    height: 2rem;
    align-items: center;
    justify-content: center;
    color: var(--muted-foreground);
    border-radius: 999px;
    transition:
      color 200ms,
      background 200ms;
  }
  .close:hover {
    color: var(--foreground);
    background: var(--muted);
  }
  .mobile-list {
    padding: 0.75rem 1.25rem calc(0.75rem + env(safe-area-inset-bottom));
    font-size: 0.875rem;
  }
  .mobile-list li + li {
    margin-top: 0.125rem;
  }
  .mobile-link {
    display: block;
    padding: 0.5rem 0.75rem;
    color: var(--muted-foreground);
    border-radius: var(--radius-md);
    transition:
      color 200ms,
      background 200ms;
  }
  .mobile-link:hover,
  .mobile-link.active {
    color: var(--foreground);
    background: var(--muted);
  }
  .mobile-link.subsection {
    padding-left: 1.75rem;
  }
  .mobile-link.active {
    font-weight: 500;
  }
  @media (width >= 96rem) {
    .desktop-toc {
      display: block;
      position: sticky;
      top: 6rem;
      width: 100%;
      max-height: calc(100vh - 8rem);
      overflow-y: auto;
      padding-block: 1rem;
    }
    .toc-toggle,
    .backdrop,
    .mobile-toc {
      display: none;
    }
  }
</style>
