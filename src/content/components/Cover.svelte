<script lang="ts">
  import PostCover from "@/components/PostCover.svelte";
  import { page } from "$app/state";
  import { staggerIn } from "@/lib/domEvent";

  interface Props {
    title: string;
    // `slug` is optional — when omitted we fall back to the route param
    // so the post page keeps working untouched. Pass it explicitly from
    // any caller that isn't `/blog/[slug]` (list views or embeds).
    slug?: string;
  }

  let { title, slug: slugProp = undefined }: Props = $props();
  const slug = $derived(slugProp ?? page.params.slug);
</script>

<div {@attach staggerIn} class="animate cover">
  <PostCover {slug} {title} frame="01" priority />
</div>

<style>
  .cover {
    margin: 2rem auto 0.5rem;
  }
</style>
