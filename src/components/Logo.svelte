<script lang="ts">
  // Pure-markup component. The empty script block is intentional — it
  // makes the default export a typed Svelte component module instead of
  // an implicit-any module, which `noImplicitAny` callers rely on when
  // they `import Logo from ".../Logo.svelte"`.
</script>

<span class="logo">
  vartifact<span class="mark">.</span>
</span>

<style>
  .logo {
    display: inline-flex;
    align-items: baseline;
    color: var(--foreground);
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.75rem;
    letter-spacing: var(--tracking-tight);
  }
  .mark {
    color: var(--primary);
  }
</style>
