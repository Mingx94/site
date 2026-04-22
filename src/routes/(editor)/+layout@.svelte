<script lang="ts">
  // Layout reset (`+layout@.svelte`) so the editor doesn't inherit the
  // site's `<Header>` / `<Footer>` / `global.css` chrome.
  //
  // CSS imports are pushed down into the individual pages (main editor
  // vs. preview iframe) so the preview iframe — which reuses this same
  // layout tree — doesn't accidentally get the paper-theme chrome styles
  // meant for the editor shell.

  interface Props {
    children: import("svelte").Snippet;
  }

  let { children }: Props = $props();
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>SVX Editor</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Kalam:wght@300;400;700&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Noto+Serif+TC:wght@200..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
  />
</svelte:head>

{@render children()}
