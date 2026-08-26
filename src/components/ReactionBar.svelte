<script lang="ts">
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
</script>

<div class="reactions" data-reactions data-slug={slug}>
  {#each Object.entries(EMOJI_MAP) as [key, { emoji, label }] (key)}
    <button
      data-reaction={key}
      data-label={label}
      disabled
      aria-label={label}
      title={label}
      class="loading"
    >
      <span class="emoji" aria-hidden="true">{emoji}</span>
      <span class="count" hidden></span>
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
