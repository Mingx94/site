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
  data-underline={underline}
  class={cn(
    "inline-block decoration-current/15 hover:decoration-current/25 text-accent-foreground hover:text-accent-foreground/80 transition-colors duration-300 ease-in-out data-underline:underline data-underline:underline-offset-2",
    className,
  )}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</a>
