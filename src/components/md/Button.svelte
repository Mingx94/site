<script lang="ts">
  import type { buttonVariants } from "@/components/ui/button";
  import { Button as ButtonUI } from "@/components/ui/button";
  import type { VariantProps } from "class-variance-authority";
  import type { Snippet } from "svelte";

  interface Props {
    href: string;
    variant?: VariantProps<typeof buttonVariants>["variant"];
    children: Snippet;
    rel?: string;
  }

  let { href, variant, children, rel }: Props = $props();
</script>

<ButtonUI
  class="no-underline"
  {variant}
  {href}
  target="_blank"
  rel="noopener noreferrer {rel ? (rel === 'follow' ? '' : rel) : 'nofollow'}"
>
  {@render children()}
</ButtonUI>
