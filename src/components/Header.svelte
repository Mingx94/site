<script lang="ts">
  import Container from "@/components/Container.svelte";
  import FontToggle from "@/components/FontToggle.svelte";
  import Link from "@/components/Link.svelte";
  import Logo from "@/components/Logo.svelte";
  import { page } from "$app/state";

  const navItems = [
    { href: "/blog", label: "文章", index: "01" },
    { href: "/about", label: "關於", index: "02" },
    { href: "/contact", label: "聯絡", index: "03" },
  ];

  function isActive(href: string): boolean {
    return (
      page.url.pathname === href || page.url.pathname.startsWith(href + "/")
    );
  }
</script>

<header>
  <Container>
    <div class="bar">
      <Link href="/" underline={false} title="首頁" class="home-link">
        <Logo />
      </Link>

      <nav>
        {#each navItems as item (item.href)}
          <Link
            href={item.href}
            underline={false}
            class="nav-link {isActive(item.href) ? 'active' : ''}"
          >
            <span class="index" aria-hidden="true">N°{item.index}</span>
            {item.label}
            {#if isActive(item.href)}
              <span class="active-line" aria-hidden="true"></span>
            {/if}
          </Link>
        {/each}
        <span class="divider" aria-hidden="true"></span>
        <FontToggle />
      </nav>
    </div>
  </Container>
</header>

<style>
  .bar,
  nav {
    display: flex;
    align-items: center;
  }
  .bar {
    justify-content: space-between;
    gap: 1rem;
  }
  nav {
    gap: 0.25rem;
  }
  :global(.home-link) {
    color: var(--foreground) !important;
  }
  :global(.nav-link) {
    position: relative;
    padding: 0.25rem 0.375rem;
    color: var(--muted-foreground) !important;
    font-size: 0.875rem;
    transition: color 200ms;
  }
  :global(.nav-link:hover) {
    color: var(--foreground) !important;
  }
  :global(.nav-link.active) {
    color: var(--primary) !important;
  }
  .index {
    display: none;
    margin-right: 0.25rem;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.6;
  }
  .active-line {
    position: absolute;
    right: 0.375rem;
    bottom: -0.125rem;
    left: 0.375rem;
    height: 1px;
    background: var(--primary);
  }
  .divider {
    width: 1px;
    height: 0.75rem;
    margin-inline: 0.25rem;
    background: var(--border);
  }
  @media (width >= 48rem) {
    nav {
      gap: 0.5rem;
    }
    .index {
      display: inline;
    }
  }
</style>
