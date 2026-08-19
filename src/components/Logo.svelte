<script lang="ts">
  // Pure-markup component. The empty script block is intentional — it
  // makes the default export a typed Svelte component module instead of
  // an implicit-any module, which `noImplicitAny` callers rely on when
  // they `import Logo from ".../Logo.svelte"`.
</script>

<span class="logo"> Vartifact </span>

<style>
  .logo {
    display: inline-flex;
    align-items: baseline;
    color: var(--foreground);
    font-size: 1.45rem;
    font-weight: 700;
    line-height: 1.75rem;
    letter-spacing: -0.035em;
  }
</style>
