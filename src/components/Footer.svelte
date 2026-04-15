<script lang="ts">
  import Container from "@/components/Container.svelte";
  import ThemeSettings from "@/components/ThemeSettings.svelte";
  import config from "@/config";
  import { staggerIn } from "@/lib/domEvent";
  import Link from "./Link.svelte";
  import RiRssLine from "~icons/ri/rss-line";
</script>

<footer use:staggerIn class="animate">
  <Container>
    <div class="flex justify-between items-center">
      <div>
        {config.params.copyright}
      </div>
      <div class="flex flex-wrap gap-3 items-center">
        <Link
          aria-label="rss feed"
          href="/rss.xml"
          external={true}
          underline={false}
          class="flex size-8 items-center justify-center"
        >
          <RiRssLine class="size-5" />
        </Link>
        <ThemeSettings />
      </div>
    </div>
  </Container>
</footer>
