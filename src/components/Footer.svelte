<script lang="ts">
  import Container from "@/components/Container.svelte";
  import ThemeSettings from "@/components/ThemeSettings.svelte";
  import config from "@/config";
  import { staggerIn } from "@/lib/domEvent";
  import Link from "./Link.svelte";
  import RiRssLine from "~icons/ri/rss-line";
</script>

<footer {@attach staggerIn} class="animate">
  <Container>
    <div class="footer-inner">
      <nav class="links" aria-label="頁尾導覽">
        <Link href="/blog" underline={false} class="footer-link">Writing</Link>
        <Link href="/about" underline={false} class="footer-link">About</Link>
        <Link href="/contact" underline={false} class="footer-link"
          >Contact</Link
        >
      </nav>

      <!-- Bottom row: copyright + controls -->
      <div class="bottom-row">
        <span class="copyright">
          {config.params.copyright}
        </span>
        <div class="controls">
          <Link
            aria-label="RSS 訂閱"
            title="RSS"
            href="/rss.xml"
            external={true}
            underline={false}
            class="rss"
          >
            <RiRssLine />
          </Link>
          <ThemeSettings />
        </div>
      </div>
    </div>
  </Container>
</footer>

<style>
  footer {
    padding-bottom: 1.5rem;
  }
  .footer-inner {
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
  }
  .bottom-row,
  .links,
  .controls {
    display: flex;
  }
  .links {
    align-items: baseline;
    gap: 1.25rem;
    margin-bottom: 1rem;
    color: var(--muted-foreground);
    font: 600 10px var(--font-sans);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  :global(.footer-link) {
    color: var(--muted-foreground) !important;
  }
  :global(.footer-link:hover) {
    color: var(--foreground) !important;
  }
  .bottom-row {
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    row-gap: 0.5rem;
    font-size: 0.875rem;
  }
  .copyright {
    color: var(--muted-foreground);
  }
  .controls {
    align-items: center;
    gap: 0.5rem;
  }
  :global(.rss) {
    display: inline-flex !important;
    width: 2rem;
    height: 2rem;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--muted-foreground) !important;
  }
  :global(.rss:hover) {
    color: var(--primary) !important;
  }
  :global(.rss:focus-visible) {
    border-color: var(--ring);
    outline: none;
  }
  :global(.rss svg) {
    width: 1rem;
    height: 1rem;
  }
  @media (width < 64rem), (pointer: coarse) {
    :global(.footer-link) {
      display: inline-flex !important;
      min-width: 2.75rem;
      min-height: 2.75rem;
      align-items: center;
      justify-content: center;
    }
    :global(.rss) {
      width: 2.75rem;
      height: 2.75rem;
    }
  }
</style>
