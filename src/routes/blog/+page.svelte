<script lang="ts">
  import ArrowCard from "@/components/ArrowCard.svelte";
  import BackToTop from "@/components/BackToTop.svelte";
  import Container from "@/components/Container.svelte";
  import { staggerIn } from "@/lib/domEvent";

  interface Props {
    data: import("./$types").PageServerData;
  }

  let { data }: Props = $props();
</script>

<Container>
  <div class="space-y-12">
    <h1 {@attach staggerIn} class="animate text-3xl font-bold tracking-tight text-foreground">文章</h1>
    <div class="space-y-10">
      {#each data.years as year}
        <section {@attach staggerIn} class="animate space-y-3">
          <h2 class="text-lg font-semibold text-muted-foreground">{year}</h2>
          <ul class="flex flex-col gap-3">
            {#each data.posts[year] as post}
              <li>
                <ArrowCard entry={post} />
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </div>

  <div {@attach staggerIn} class="animate flex mt-20">
    <BackToTop />
  </div>
</Container>
