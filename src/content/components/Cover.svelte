<script>
  import { staggerIn } from "@/lib/domEvent";

  let { image, title } = $props();
</script>

<enhanced:img
  {@attach staggerIn}
  src={`${image}?w=1280;640;400&blur=15`}
  sizes="(min-width:1920px) 1280px, (min-width:1080px) 640px, (min-width:768px) 400px"
  alt={title}
  fetchpriority="high"
  class="rounded-lg mx-auto animate mt-8 mb-2 object-cover aspect-3/2"
  loading="eager"
/>
