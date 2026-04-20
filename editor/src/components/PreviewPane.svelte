<script lang="ts">
  import { tabs } from '$state/tabs.svelte';
  import { files } from '$state/files.svelte';
  import { parseDoc } from '$lib/frontmatter';
  import { wordCount, readingTime } from '$lib/util';
  import { setCurrentSlug } from '$lib/sveltekit-shim/state.svelte';
  import { postsStore, coverBust } from '$state/posts.svelte';
  import { assetUrlFor } from '$lib/io/fs-access';
  import DynamicSvx from '$preview/DynamicSvx.svelte';

  const activeFile = $derived(tabs.active ? files.byPath[tabs.active] : null);
  const parsed = $derived(
    activeFile ? parseDoc(activeFile.content) : { fm: {}, body: '' },
  );

  const fm = $derived(parsed.fm as Record<string, unknown>);
  const body = $derived(parsed.body);

  // The site's <Cover /> resolves the cover image by post slug
  // (the parent directory name of the .svx file). Drive that via the
  // $app/state shim so the component renders without SvelteKit's runtime.
  const slug = $derived(deriveSlug(tabs.active));
  $effect(() => {
    setCurrentSlug(slug);
  });

  // Cover image URL — bypasses Cover.svelte's build-time `import.meta.glob`
  // (which Vite's enhanced-img loader caches and doesn't invalidate when
  // the file changes), going straight to the dev server's asset endpoint
  // with a cache-bust counter that CoverPicker bumps on upload/remove.
  // Trade-off: editor preview loses Cover.svelte's LQIP fade transition,
  // but every replace lands instantly in the preview.
  const post = $derived(postsStore.list.find((p) => p.slug === slug));
  const coverUrl = $derived.by(() => {
    if (!post?.coverPath) return null;
    const v = coverBust[slug] ?? 0;
    return `${assetUrlFor(post.coverPath)}&v=${v}`;
  });

  const title = $derived(typeof fm.title === 'string' ? fm.title : '');
  const description = $derived(
    typeof fm.description === 'string' ? fm.description : '',
  );
  const date = $derived(formatStamp(fm.date));
  const updated = $derived(formatStamp(fm.updated));
  const draft = $derived(fm.draft === true);
  const minutes = $derived(readingTime(wordCount(body)));

  function deriveSlug(path: string | null): string {
    if (!path) return '';
    // Path is workspace-relative; the slug is the parent directory name.
    // e.g. 'why-astro/article.svx' → 'why-astro'
    const segs = path.split('/').filter(Boolean);
    return segs.length >= 2 ? segs[segs.length - 2] : '';
  }

  function formatStamp(d: unknown): string {
    if (!d) return '';
    const date = new Date(d as string);
    if (isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }
</script>

<div class="pane pane-preview">
  {#if activeFile}
    <article class="article-preview">
      <!-- Masthead strip -->
      <div
        class="flex items-baseline justify-between gap-4 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <span>· Essay{date ? ` · ${date}` : ''}</span>
        {#if draft}
          <span class="text-destructive">Draft</span>
        {/if}
      </div>

      <!-- Title block -->
      <div class="mt-8 md:mt-12 mb-10 md:mb-14 space-y-6">
        {#if title}
          <h1
            class="text-balance break-words font-bold leading-[1.05] tracking-tight text-foreground text-[clamp(1.75rem,4vw,3.25rem)]"
          >
            {title}
          </h1>
        {/if}
        {#if description}
          <p
            class="max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground"
          >
            {description}
          </p>
        {/if}
      </div>

      <!-- Byline ruler -->
      <div
        class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-y border-border py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-12 md:mb-16"
      >
        <span>By Michael Tsai</span>
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {#if date}<span>{date}</span>{/if}
          <span aria-hidden="true">·</span>
          <span>{minutes} min read</span>
        </div>
      </div>

      <!-- Cover image — see coverUrl derivation above -->
      {#if coverUrl}
        <div
          class="relative mx-auto mt-8 mb-2 aspect-3/2 overflow-hidden rounded-lg"
        >
          <img
            src={coverUrl}
            alt={title}
            class="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      {/if}

      <!-- Rendered .svx body — styled via shared .content class -->
      <div class="content">
        <DynamicSvx source={body} frontmatter={fm} />
      </div>

      <!-- Colophon -->
      <div
        class="mt-16 flex flex-wrap items-baseline justify-between gap-y-2 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        {#if date}<span>Filed {date}</span>{/if}
        {#if updated}<span>Revised {updated}</span>{/if}
      </div>
    </article>
  {:else}
    <div class="ed-empty">（沒有選擇檔案）</div>
  {/if}
</div>
