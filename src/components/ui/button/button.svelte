<script lang="ts">
  import { cn } from "@/lib/utils";
  import { buttonVariants, type ButtonProps } from "./button";

  let {
    class: className,
    variant = "default",
    size = "default",
    ref = $bindable(null),
    href = undefined,
    type = "button",
    disabled,
    children,
    ...restProps
  }: ButtonProps = $props();
</script>

{#if href}
  <a
    bind:this={ref}
    data-slot="button"
    class={cn(buttonVariants({ variant, size }), className)}
    href={disabled ? undefined : href}
    aria-disabled={disabled}
    role={disabled ? "link" : undefined}
    tabindex={disabled ? -1 : undefined}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    bind:this={ref}
    data-slot="button"
    class={cn(buttonVariants({ variant, size }), className)}
    {type}
    {disabled}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}

<style>
  .button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    outline: none;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    text-decoration: none;
    transition: background-color 150ms, color 150ms, border-color 150ms,
      box-shadow 150ms;
  }

  .button:focus-visible {
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);
  }

  .button[aria-invalid="true"] {
    border-color: var(--destructive);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--destructive) 20%, transparent);
  }

  .button:disabled,
  .button[aria-disabled="true"] {
    pointer-events: none;
    opacity: 0.5;
  }

  .button :global(svg) {
    flex-shrink: 0;
    pointer-events: none;
  }

  .button :global(svg:not([class*="size-"])) { inline-size: 1rem; block-size: 1rem; }

  .button--variant-default {
    background: var(--primary);
    color: var(--primary-foreground);
    box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 8%, transparent);
  }

  .button--variant-default:hover { background: color-mix(in oklch, var(--primary) 90%, transparent); }
  .button--variant-destructive { background: var(--destructive); color: white; }
  .button--variant-destructive:hover { background: color-mix(in oklch, var(--destructive) 90%, transparent); }
  .button--variant-outline { border-color: var(--border); background: var(--background); box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 8%, transparent); }
  .button--variant-outline:hover, .button--variant-ghost:hover { background: var(--accent); color: var(--accent-foreground); }
  .button--variant-secondary { background: var(--secondary); color: var(--secondary-foreground); }
  .button--variant-secondary:hover { background: color-mix(in oklch, var(--secondary) 80%, transparent); }
  .button--variant-link { border-radius: 0; color: var(--primary); text-underline-offset: 0.25rem; }
  .button--variant-link:hover { text-decoration: underline; }
  .button--size-default { min-block-size: 2.25rem; padding: 0.5rem 1rem; }
  .button--size-sm { min-block-size: 2rem; gap: 0.375rem; padding: 0.5rem 0.75rem; }
  .button--size-lg { min-block-size: 2.5rem; padding: 0.5rem 1.5rem; }
  .button--size-icon { inline-size: 2.25rem; block-size: 2.25rem; }

  :global(.dark) .button--variant-destructive { background: color-mix(in oklch, var(--destructive) 60%, transparent); }
  :global(.dark) .button--variant-outline { background: color-mix(in oklch, var(--input) 30%, transparent); border-color: var(--input); }
  :global(.dark) .button--variant-outline:hover { background: color-mix(in oklch, var(--input) 50%, transparent); }
  :global(.dark) .button--variant-ghost:hover { background: color-mix(in oklch, var(--accent) 50%, transparent); }
</style>
