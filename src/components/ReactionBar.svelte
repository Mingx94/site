<script lang="ts">
  import { getReactions, addReaction, removeReaction } from "@/lib/blog.remote";

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
      try {
        await removeReaction({ slug, emoji });
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

<div class="reactions">
  {#each Object.entries(EMOJI_MAP) as [key, { emoji, label }] (key)}
    <button
      onclick={() => react(key)}
      disabled={reactionsQuery.loading}
      aria-label="{label}{reactionsQuery.current?.[key]
        ? `，${reactionsQuery.current[key]} 個`
        : ''}"
      title={label}
      class:reacted={reacted.has(key)}
      class:loading={reactionsQuery.loading}
    >
      <span class="emoji" aria-hidden="true">{emoji}</span>
      {#if reactionsQuery.current?.[key]}
        <span class="count">{reactionsQuery.current[key]}</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .reactions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
  }
  button {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    cursor: pointer;
    transition:
      background 200ms,
      border-color 200ms;
  }
  button:hover {
    border-color: color-mix(in oklch, var(--primary) 30%, transparent);
    background: var(--muted);
  }
  button.reacted {
    border-color: color-mix(in oklch, var(--primary) 30%, transparent);
    background: color-mix(in oklch, var(--primary) 10%, transparent);
  }
  button.loading {
    opacity: 0.5;
  }
  .emoji {
    font-size: 1.125rem;
  }
  .count {
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }
</style>
