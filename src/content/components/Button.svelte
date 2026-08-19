<script lang="ts">
  import type { ButtonVariant } from "@/components/ui/button";
  import { Button as ButtonUI } from "@/components/ui/button";
  import type { Snippet } from "svelte";

  interface Props {
    href: string;
    variant?: ButtonVariant;
    children: Snippet;
    rel?: string;
  }

  let { href, variant, children, rel }: Props = $props();
</script>

<ButtonUI
  class="article-button"
  {variant}
  {href}
  target="_blank"
  rel="noopener noreferrer {rel ? (rel === 'follow' ? '' : rel) : 'nofollow'}"
>
  {@render children()}
</ButtonUI>

<style>
  :global(.article-button) {
    text-decoration: none;
  }
</style>
