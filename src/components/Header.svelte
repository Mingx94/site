<script lang="ts">
  import Container from "@/components/Container.svelte";
  import FontToggle from "@/components/FontToggle.svelte";
  import Link from "@/components/Link.svelte";
  import Logo from "@/components/Logo.svelte";
  import { page } from "$app/state";

  const navItems = [
    { href: "/blog", label: "Writing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
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
    padding-bottom: 0.9rem;
    border-bottom: 1px solid
      color-mix(in srgb, var(--foreground) 72%, transparent);
  }
  nav {
    gap: clamp(0.1rem, 1vw, 1.25rem);
  }
  :global(.home-link) {
    color: var(--foreground) !important;
  }
  :global(.nav-link) {
    position: relative;
    padding: 0.35rem 0.45rem;
    color: var(--muted-foreground) !important;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 200ms;
  }
  :global(.nav-link:hover) {
    color: var(--foreground) !important;
  }
  :global(.nav-link.active) {
    color: var(--primary) !important;
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
      gap: 1rem;
    }
  }
  @media (width < 30rem) {
    .bar {
      gap: 0.5rem;
    }
    nav {
      gap: 0;
    }
    :global(.nav-link) {
      padding-inline: 0.25rem;
      font-size: 0.875rem;
    }
    .divider {
      margin-inline: 0.1rem;
    }
    :global(.font-toggle .toggle) {
      padding-inline: 0.25rem;
    }
  }
  @media (width < 23rem) {
    .bar {
      flex-direction: column;
      align-items: stretch;
    }
    nav {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
