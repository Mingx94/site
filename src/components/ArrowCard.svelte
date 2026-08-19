<script lang="ts">
  import type { Post } from "@/lib/posts";

  interface Props {
    entry: Post;
  }

  let { entry }: Props = $props();
</script>

<a
  href={`/blog/${entry.id}`}
  class="card"
>
  <div class="copy">
    <div class="title">{entry.title}</div>
    <div class="description">{entry.description}</div>
  </div>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    class="arrow"
  >
    <line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
      class="shaft"
    ></line>
    <polyline
      points="12 5 19 12 12 19"
      class="head"
    ></polyline>
  </svg>
</a>

<style>
  .card { position: relative; display: flex; align-items: center; gap: 1rem; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 0.75rem 3rem 0.75rem 1rem; background: var(--card); color: var(--card-foreground); text-decoration: none; transition: background-color 300ms ease-in-out, border-color 300ms ease-in-out; }
  .card:hover { border-color: color-mix(in oklch, var(--primary) 40%, var(--border)); background: color-mix(in oklch, var(--secondary) 50%, transparent); }
  .copy { flex: 1; min-inline-size: 0; }
  .title { overflow: hidden; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  .description { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; line-clamp: 2; -webkit-line-clamp: 2; font-size: 0.875rem; }
  .arrow { position: absolute; inset: 50% 1rem auto auto; inline-size: 1.5rem; block-size: 1.5rem; transform: translateY(-50%); fill: none; stroke: currentColor; stroke-width: 1; transition: stroke 300ms; }
  .card:hover .arrow { stroke: var(--primary); }
  .shaft { transform: translateX(0.75rem) scaleX(0); transform-origin: right; transition: transform 300ms ease-in-out; }
  .head { transform: translateX(-0.25rem); transition: transform 300ms ease-in-out; }
  .card:hover .shaft { transform: translateX(0) scaleX(1); }
  .card:hover .head { transform: translateX(0); }
  @media (width >= 48rem) { .card { padding-inline-end: 3.75rem; } .arrow { inline-size: 2rem; block-size: 2rem; } }
</style>
