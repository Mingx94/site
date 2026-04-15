<script lang="ts">
  import { onMount } from "svelte";

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

  let reactions = $state<Record<string, number>>({});
  let reacted = $state<Set<string>>(new Set());

  function getStorageKey() {
    return `reactions:${slug}`;
  }

  onMount(async () => {
    // Load previously reacted emojis from localStorage
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) reacted = new Set(JSON.parse(stored));
    } catch {
      // ignore
    }

    // Fetch current counts
    try {
      const res = await fetch(`/api/reactions/${slug}`);
      if (res.ok) reactions = await res.json();
    } catch {
      // ignore
    }
  });

  async function react(emoji: string) {
    if (reacted.has(emoji)) return;

    reacted.add(emoji);
    reacted = new Set(reacted);

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify([...reacted]));
    } catch {
      // ignore
    }

    reactions[emoji] = (reactions[emoji] ?? 0) + 1;

    try {
      await fetch(`/api/reactions/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {
      // ignore, optimistic update already applied
    }
  }
</script>

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
      {#if reactions[key]}
        <span class="text-sm text-muted-foreground">{reactions[key]}</span>
      {/if}
    </button>
  {/each}
</div>
