<script lang="ts">
  import BackToPrev from "@/components/BackToPrev.svelte";
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import FormattedDate from "@/components/FormattedDate.svelte";

  interface Props {
    data: import("./$types").PageServerData;
  }

  let { data }: Props = $props();
  let { post } = $derived(data);
</script>

<Container>
  <article>
    <div class="space-y-1 my-10">
      <div class="animate flex items-center gap-1.5">
        <div class="text-sm">
          <FormattedDate date={post.date} />
        </div>
        {#if post.draft}
          <div
            class="text-sm text-red-500 border border-red-500 rounded-lg px-2 py-0.5"
          >
            Draft
          </div>
        {/if}
      </div>
      <h1 class="animate text-2xl font-semibold text-black dark:text-white">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html post.title}
      </h1>
    </div>

    {#if post.image}
      <div class="animate mt-8 mb-2">
        <img
          src={post.image}
          alt={post.title}
          class="rounded-lg mx-auto"
          loading="eager"
        />
      </div>
    {/if}

    <div class="animate content">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html post.html}
    </div>
  </article>

  <div class="animate flex mt-16">
    <BackToPrev />
    <BackToTop />
  </div>
</Container>
