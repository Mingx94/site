<script lang="ts">
  import { onMount } from "svelte";

  interface Heading {
    id: string;
    text: string;
    level: number;
  }

  let headings = $state<Heading[]>([]);
  let activeId = $state("");

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

{#if headings.length > 0}
  <nav class="hidden xl:block fixed top-32 right-8 w-56 max-h-[calc(100vh-12rem)] overflow-y-auto">
    <div class="text-xs font-semibold text-muted-foreground mb-2">目錄</div>
    <ul class="space-y-1 text-sm border-l border-border">
      {#each headings as heading}
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
{/if}
