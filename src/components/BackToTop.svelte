<script lang="ts">
  import { Button } from "@/components/ui/button";

  const scrollTop = () => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  };
</script>

<Button
  variant="outline"
  id="back-to-top"
  class="back-button"
  onclick={scrollTop}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    class="arrow"
  >
    <line x1="5" y1="12" x2="19" y2="12" class="shaft" />
    <polyline points="12 5 5 12 12 19" class="head" />
  </svg>
  <div>回到頂端</div>
</Button>

<style>
  :global(.back-button) {
    margin-left: auto;
    padding: 0.375rem 0.75rem 0.375rem 2rem;
  }
  .arrow {
    width: 1rem;
    height: 1rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    transform: rotate(90deg);
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
  div {
    font-size: 0.875rem;
  }
</style>
