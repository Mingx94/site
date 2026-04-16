<script lang="ts">
  import { getReactions, addReaction } from "@/lib/blog.remote";

  interface Props {
    slug: string;
  }

  let { slug }: Props = $props();

  const EMOJI_MAP: Record<string, { emoji: string; label: string }> = {
    thumbsup: { emoji: "\u{1F44D}", label: "讚" },
    heart: { emoji: "\u2764\uFE0F", label: "愛心" },
    fire: { emoji: "\u{1F525}", label: "火熱" },
    bulb: { emoji: "\u{1F4A1}", label: "啟發" },
    party: { emoji: "\u{1F389}", label: "慶祝" },
  };

  // Anchor query to reactive context — addReaction calls refresh() → auto-updates
  const reactionsQuery = $derived(getReactions(slug));

  let reacted = $state<Set<string>>(new Set());

  // Load reacted set from localStorage
  $effect(() => {
    try {
      const stored = localStorage.getItem(`reactions:${slug}`);
      if (stored) reacted = new Set(JSON.parse(stored));
    } catch {
      // ignore
    }
  });

  async function react(emoji: string) {
    if (reacted.has(emoji)) {
      reacted.delete(emoji);
      try {
        localStorage.setItem(`reactions:${slug}`, JSON.stringify([...reacted]));
      } catch {
        // ignore
      }
      return;
    }

    reacted.add(emoji);

    try {
      localStorage.setItem(`reactions:${slug}`, JSON.stringify([...reacted]));
    } catch {
      // ignore
    }

    try {
      await addReaction({ slug, emoji });
    } catch {
      // ignore
    }
  }
</script>

<div class="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border">
  {#each Object.entries(EMOJI_MAP) as [key, { emoji, label }]}
    <button
      onclick={() => react(key)}
      disabled={reactionsQuery.loading}
      aria-label="{label}{reactionsQuery.current?.[key] ? `，${reactionsQuery.current[key]} 個` : ''}"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors duration-200
        {reacted.has(key)
        ? 'border-primary/30 bg-primary/10 cursor-pointer'
        : 'border-border hover:border-primary/30 hover:bg-muted cursor-pointer'}
        {reactionsQuery.loading ? 'opacity-50' : ''}"
    >
      <span class="text-lg" aria-hidden="true">{emoji}</span>
      {#if reactionsQuery.current?.[key]}
        <span class="text-sm text-muted-foreground">{reactionsQuery.current[key]}</span>
      {/if}
    </button>
  {/each}
</div>
