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

<header class="pt-5">
  <Container>
    <div class="flex items-center justify-between gap-4">
      <Link href="/" underline={false} title="首頁" class="!text-foreground">
        <Logo />
      </Link>

      <nav class="flex items-center gap-1 md:gap-2">
        {#each navItems as item}
          <Link
            href={item.href}
            underline={false}
            class="group relative px-1.5 py-1 text-sm transition-colors duration-200 {isActive(
              item.href,
            )
              ? '!text-primary'
              : '!text-muted-foreground hover:!text-foreground'}"
          >
            <span
              class="mr-1 hidden font-mono text-[9px] uppercase tracking-widest opacity-60 md:inline"
              aria-hidden="true">N°{item.index}</span
            >
            {item.label}
            {#if isActive(item.href)}
              <span
                class="absolute -bottom-0.5 left-1.5 right-1.5 h-px bg-primary"
                aria-hidden="true"
              ></span>
            {/if}
          </Link>
        {/each}
        <span class="mx-1 h-3 w-px bg-border" aria-hidden="true"></span>
        <FontToggle />
      </nav>
    </div>
  </Container>
</header>
