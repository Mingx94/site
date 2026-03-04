<script lang="ts">
  import Container from "@/components/Container.svelte";
  import Link from "@/components/Link.svelte";
  import Logo from "@/components/Logo.svelte";
</script>

<header class="pt-6">
  <Container>
    <div class="flex flex-wrap gap-y-2 justify-between items-center">
      <Link href="/" underline={false} title="首頁">
        <Logo />
      </Link>
      <nav class="flex gap-1">
        <Link href="/blog">blog</Link>
      </nav>
    </div>
  </Container>
</header>
