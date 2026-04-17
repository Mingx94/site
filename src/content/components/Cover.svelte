<script>
  import { staggerIn } from "@/lib/domEvent";

  let { image, placeholder, title } = $props();
  let loaded = $state(false);
</script>

<div
  {@attach staggerIn}
  class="animate relative mx-auto mt-8 mb-2 aspect-3/2 overflow-hidden rounded-lg"
>
  <!-- LQIP: tiny blurred placeholder -->
  <enhanced:img
    src={placeholder}
    alt=""
    aria-hidden="true"
    class="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
  />

  <!-- Full image fades in on top -->
  <enhanced:img
    src={image}
    sizes="(min-width:1920px) 1280px, (min-width:1080px) 640px, (min-width:768px) 400px"
    alt={title}
    fetchpriority="high"
    onload={() => (loaded = true)}
    class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out"
    style:opacity={loaded ? 1 : 0}
    loading="eager"
  />
</div>
