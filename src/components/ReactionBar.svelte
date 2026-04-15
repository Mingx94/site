<script lang="ts">
  import { getReactions, addReaction } from "@/lib/blog.remote";

  interface Props {
    slug: string;
  }

  let { slug }: Props = $props();

  const EMOJI_MAP: Record<string, string> = {
    thumbsup: "\u{1F44D}",
    heart: "\u2764\uFE0F",
    fire: "\u{1F525}",
    bulb: "\u{1F4A1}",
    party: "\u{1F389}",
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
    if (reacted.has(emoji)) return;

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

{#if !reactionsQuery.loading}
  <div class="flex flex-wrap gap-2 mt-8">
    {#each Object.entries(EMOJI_MAP) as [key, emoji]}
      <button
        onclick={() => react(key)}
        disabled={reacted.has(key)}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors duration-200
          {reacted.has(key)
          ? 'border-primary/30 bg-primary/10 cursor-default'
          : 'border-border hover:border-primary/30 hover:bg-muted cursor-pointer'}"
      >
        <span class="text-lg">{emoji}</span>
        {#if reactionsQuery.current?.[key]}
          <span class="text-sm text-muted-foreground">{reactionsQuery.current[key]}</span>
        {/if}
      </button>
    {/each}
  </div>
{/if}
