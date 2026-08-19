<script lang="ts">
  import { cn } from "@/lib/utils";
  import type { Snippet } from "svelte";

  interface Props {
    href: string;
    external?: boolean;
    underline?: boolean;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let {
    href,
    external = false,
    underline = true,
    class: className = "",
    children,
    ...rest
  }: Props = $props();
</script>

<a
  {href}
  target={external ? "_blank" : undefined}
  rel={external ? "noopener noreferrer" : undefined}
  data-underline={underline}
  class={cn("link", className)}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</a>

<style>
  .link {
    display: inline-block;
    color: var(--accent-foreground);
    text-decoration-color: color-mix(in oklch, var(--primary) 30%, transparent);
    transition:
      color 300ms ease-in-out,
      text-decoration-color 300ms ease-in-out;
  }
  .link[data-underline="true"] {
    text-decoration-line: underline;
    text-underline-offset: 2px;
  }
  .link:hover {
    color: var(--primary);
    text-decoration-color: color-mix(in oklch, var(--primary) 60%, transparent);
  }
</style>
