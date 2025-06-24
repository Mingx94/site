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
  class="group ml-auto py-1.5 pr-3 pl-8"
  onclick={scrollTop}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="size-4 rotate-90 fill-none stroke-current stroke-2"
  >
    <line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
      class="translate-x-2 scale-x-0 transition-transform duration-300 ease-in-out group-hover:translate-x-0 group-hover:scale-x-100"
    />
    <polyline
      points="12 5 5 12 12 19"
      class="translate-x-1 transition-transform duration-300 ease-in-out group-hover:translate-x-0"
    />
  </svg>
  <div class="text-sm">回到頂端</div>
</Button>
