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
    <div use:staggerIn class="animate font-semibold text-black dark:text-white">Blog</div>
    <div class="space-y-4">
      {#each data.years as year}
        <section use:staggerIn class="animate space-y-4">
          <div class="font-semibold text-black dark:text-white">{year}</div>
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

  <div use:staggerIn class="animate flex mt-16">
    <BackToTop />
  </div>
</Container>
