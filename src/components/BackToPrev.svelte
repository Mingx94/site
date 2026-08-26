<script lang="ts">
  import { Button } from "@/components/ui/button";
</script>

<Button variant="outline" class="back-button" data-back-to-prev>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    class="arrow"
  >
    <line x1="5" y1="12" x2="19" y2="12" class="shaft"></line>
    <polyline points="12 5 5 12 12 19" class="head"></polyline>
  </svg>
  <span data-back-label>前往文章列表</span>
</Button>

<style>
  :global(.back-button) {
    padding: 0.375rem 0.75rem 0.375rem 2rem;
  }
  .arrow {
    width: 1rem;
    height: 1rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }
  .shaft,
  .head {
    transition: transform 300ms ease-in-out;
  }
  .shaft {
    transform: translateX(0.5rem) scaleX(0);
  }
  .head {
    transform: translateX(0.25rem);
  }
  :global(.back-button:hover) .shaft {
    transform: none;
  }
  :global(.back-button:hover) .head {
    transform: none;
  }
  span {
    font-size: 0.875rem;
  }
</style>
