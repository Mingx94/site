<script lang="ts">
  import Container from "@/components/Container.svelte";
  import FontToggle from "@/components/FontToggle.svelte";
  import Link from "@/components/Link.svelte";
  import Logo from "@/components/Logo.svelte";
  import { page } from "$app/state";

  const navItems = [
    { href: "/blog", label: "文章" },
    { href: "/contact", label: "聯絡" },
  ];

  function isActive(href: string): boolean {
    return page.url.pathname === href || page.url.pathname.startsWith(href + "/");
  }
</script>

<header class="pt-6">
  <Container>
    <div class="flex flex-wrap gap-y-2 justify-between items-center">
      <Link href="/" underline={false} title="首頁">
        <Logo />
      </Link>
      <nav class="flex items-center gap-1">
        {#each navItems as item}
          <Link
            href={item.href}
            underline={false}
            class={isActive(item.href) ? "text-primary font-semibold" : ""}
          >
            {item.label}
          </Link>
        {/each}
        <span class="mx-1 h-4 w-px bg-border" aria-hidden="true"></span>
        <FontToggle />
      </nav>
    </div>
  </Container>
</header>
