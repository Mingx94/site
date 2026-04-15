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
  <div class="space-y-10">
    <h1 {@attach staggerIn} class="animate text-2xl font-semibold text-foreground">文章</h1>
    <div class="space-y-4">
      {#each data.years as year}
        <section {@attach staggerIn} class="animate space-y-4">
          <h2 class="font-semibold text-foreground">{year}</h2>
          <div>
            <ul class="flex flex-col gap-4">
              {#each data.posts[year] as post}
                <li>
                  <ArrowCard entry={post} />
                </li>
              {/each}
            </ul>
          </div>
        </section>
      {/each}
    </div>
  </div>

  <div {@attach staggerIn} class="animate flex mt-16">
    <BackToTop />
  </div>
</Container>
