<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "@/components/ui/button";

  let hasSameOriginReferrer = $state(false);

  onMount(() => {
    hasSameOriginReferrer = document.referrer.includes(window.location.origin);
  });

  function onClick() {
    if (hasSameOriginReferrer) {
      window.history.back();
    } else {
      window.location.href = "/blog";
    }
  }
</script>

<Button
  variant="outline"
  class="group py-1.5 pr-3 pl-8"
  onclick={onClick}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="size-4 fill-none stroke-current stroke-2"
  >
    <line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
      class="translate-x-2 scale-x-0 transition-transform duration-300 ease-in-out group-hover:translate-x-0 group-hover:scale-x-100"
    ></line>
    <polyline
      points="12 5 5 12 12 19"
      class="translate-x-1 transition-transform duration-300 ease-in-out group-hover:translate-x-0"
    ></polyline>
  </svg>
  <span class="text-sm">{hasSameOriginReferrer ? "回上一頁" : "前往文章列表"}</span>
</Button>
