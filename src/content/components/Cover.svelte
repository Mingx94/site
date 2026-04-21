<script module lang="ts">
  // Eagerly pick up every post's cover image at two resolutions:
  // the main srcset (served responsively) and a pre-blurred 32px LQIP.
  // Module-level so glob evaluates once per build, not per instance.
  // Path is relative to this component so it resolves the same in both
  // the SvelteKit site (Vite root = site/) and the editor sub-app
  // (Vite root = site/editor/).
  const covers = import.meta.glob<{ default: string }>(
    "../posts/*/cover.jpg",
    {
      eager: true,
      query: { enhanced: true, w: "1280;640;400" },
    },
  );

  const placeholders = import.meta.glob<{ default: string }>(
    "../posts/*/cover.jpg",
    {
      eager: true,
      query: { enhanced: true, w: "32", blur: "10" },
    },
  );
</script>

<script lang="ts">
  import { page } from "$app/state";
  import { staggerIn } from "@/lib/domEvent";

  interface Props {
    title: string;
    // `slug` is optional — when omitted we fall back to the route param
    // so the post page keeps working untouched. Pass it explicitly from
    // any caller that isn't `/blog/[slug]` (list views, editor preview,
    // embeds…).
    slug?: string;
  }

  let { title, slug: slugProp = undefined }: Props = $props();
  let loaded = $state(false);

  const slug = $derived(slugProp ?? page.params.slug);
  const key = $derived(`../posts/${slug}/cover.jpg`);
  const image = $derived(covers[key]?.default);
  const placeholder = $derived(placeholders[key]?.default);
</script>

{#if image && placeholder}
  <div
    {@attach staggerIn}
    class="animate relative mx-auto mt-8 mb-2 aspect-3/2 overflow-hidden rounded-lg"
  >
    <!-- LQIP: tiny pre-blurred placeholder -->
    <enhanced:img
      src={placeholder}
      alt=""
      aria-hidden="true"
      class="absolute inset-0 h-full w-full object-cover"
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
{/if}
