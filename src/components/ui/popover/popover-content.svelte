<script lang="ts">
  import { Popover as PopoverPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 4,
    align = "center",
    width = "default",
    portalProps,
    ...restProps
  }: PopoverPrimitive.ContentProps & {
    width?: "default" | "fit";
    portalProps?: PopoverPrimitive.PortalProps;
  } = $props();
</script>

<PopoverPrimitive.Portal {...portalProps}>
  <PopoverPrimitive.Content
    bind:ref
    data-slot="popover-content"
    {sideOffset}
    {align}
    data-width={width}
    class={cn("popover-content", className)}
    {...restProps}
  />
</PopoverPrimitive.Portal>

<style>
  :global(.popover-content) {
    z-index: 50;
    inline-size: 18rem;
    transform-origin: var(--bits-popover-content-transform-origin);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1rem;
    outline: none;
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: 0 4px 6px
      color-mix(in oklch, var(--foreground) 12%, transparent);
  }

  :global(.popover-content[data-state="open"]) {
    animation: popover-in 150ms ease-out;
  }
  :global(.popover-content[data-state="closed"]) {
    animation: popover-out 150ms ease-in;
  }
  :global(.popover-content[data-side="bottom"]) {
    --popover-slide: translateY(-0.5rem);
  }
  :global(.popover-content[data-side="left"]) {
    --popover-slide: translateX(0.5rem);
  }
  :global(.popover-content[data-side="right"]) {
    --popover-slide: translateX(-0.5rem);
  }
  :global(.popover-content[data-side="top"]) {
    --popover-slide: translateY(0.5rem);
  }
  :global(.popover-content[data-width="fit"]) {
    inline-size: fit-content;
  }

  @keyframes popover-in {
    from {
      opacity: 0;
      transform: var(--popover-slide, scale(0.95));
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes popover-out {
    from {
      opacity: 1;
      transform: none;
    }
    to {
      opacity: 0;
      transform: var(--popover-slide, scale(0.95));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.popover-content[data-state]) {
      animation: none;
    }
  }
</style>
