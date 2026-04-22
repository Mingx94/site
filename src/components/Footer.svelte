<script lang="ts">
  import Container from "@/components/Container.svelte";
  import ThemeSettings from "@/components/ThemeSettings.svelte";
  import config from "@/config";
  import { staggerIn } from "@/lib/domEvent";
  import { dev } from "$app/environment";
  import Link from "./Link.svelte";
  import RiRssLine from "~icons/ri/rss-line";
  import RiQuillPenLine from "~icons/ri/quill-pen-line";
</script>

<footer {@attach staggerIn} class="animate pb-6">
  <Container>
    <div class="border-t border-border pt-5">
      <!-- Top row: masthead + service links -->
      <div
        class="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <span>— Vartifact / Personal Site</span>
        <div class="flex items-baseline gap-5">
          <Link
            href="/blog"
            underline={false}
            class="!text-muted-foreground hover:!text-foreground">Writing</Link
          >
          <Link
            href="/about"
            underline={false}
            class="!text-muted-foreground hover:!text-foreground">About</Link
          >
          <Link
            href="/contact"
            underline={false}
            class="!text-muted-foreground hover:!text-foreground">Contact</Link
          >
        </div>
      </div>

      <!-- Bottom row: copyright + controls -->
      <div
        class="flex flex-wrap items-center justify-between gap-y-2 text-sm"
      >
        <span class="text-muted-foreground">
          {config.params.copyright}
        </span>
        <div class="flex items-center gap-2">
          {#if dev}
            <!-- Dev-only entry to the local-CMS editor. `dev` comes from
                 `$app/environment`; in production builds the `{#if}` is
                 statically false, so this block is dead-code-eliminated
                 and ships nothing. Opens in a new tab so the site stays
                 open for side-by-side comparison while editing. -->
            <Link
              aria-label="編輯器（dev）"
              title="編輯器"
              href="/editor"
              external={true}
              underline={false}
              class="inline-flex size-8 items-center justify-center rounded-md !text-muted-foreground transition-colors hover:!text-primary"
            >
              <RiQuillPenLine class="size-4" />
            </Link>
          {/if}
          <Link
            aria-label="RSS 訂閱"
            title="RSS"
            href="/rss.xml"
            external={true}
            underline={false}
            class="inline-flex size-8 items-center justify-center rounded-md !text-muted-foreground transition-colors hover:!text-primary"
          >
            <RiRssLine class="size-4" />
          </Link>
          <ThemeSettings />
        </div>
      </div>
    </div>
  </Container>
</footer>
