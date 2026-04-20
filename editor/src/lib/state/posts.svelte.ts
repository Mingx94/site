// Article-level view of the workspace. Derives a list of posts from the
// raw filesystem tree (one post = a `posts/<slug>/` directory containing
// `article.svx`) and lazily caches each post's frontmatter so the sidebar
// can display titles instead of slugs.

import {
  workspace,
  createDir,
  renamePath,
  deletePath,
  refreshTree,
} from './workspace.svelte';
import type { TreeNode } from '$lib/io/fs-access';
import { readFileRel, createFileRel } from '$lib/io/fs-access';
import { parseDoc } from '$lib/frontmatter';

export type PostSummary = {
  slug: string;
  // Workspace-relative path: 'posts/<slug>/article.svx'
  articlePath: string;
  // Workspace-relative path of the cover image, or null if absent.
  // Matches site/src/content/components/Cover.svelte's glob (cover.jpg).
  coverPath: string | null;
};

export type PostMeta = {
  title: string;
  description: string;
  date: string;
  draft: boolean;
};

// Reactive metadata cache, keyed by articlePath. Components read
// `postMeta[path]?.title` directly; loading happens via loadPostMeta().
const metaCache = $state<Record<string, PostMeta>>({});
export const postMeta = metaCache;

// Cache-bust counter per slug. Bumped after the cover image is replaced
// so any DOM referencing the cover via assetUrlFor can append `&v=…` and
// dodge the browser disk cache. Vite's enhanced-img loader doesn't react
// to file changes for already-evaluated globs, so the article preview
// renders the cover via this counter instead of going through Cover.svelte.
const coverBustState = $state<Record<string, number>>({});
export const coverBust = coverBustState;

export function bumpCoverBust(slug: string): void {
  coverBustState[slug] = (coverBustState[slug] ?? 0) + 1;
}

// Wrapped in a class so $derived can be re-evaluated on every read inside
// a reactive consumer. Module-level `export const x = $derived.by(...)`
// would freeze x at import time — see Svelte 5 docs on exporting state.
class PostsStore {
  list = $derived.by<PostSummary[]>(() => {
    const postsDir = workspace.tree.find(
      (n: TreeNode) => n.type === 'dir' && n.name === 'posts',
    );
    if (!postsDir || postsDir.type !== 'dir') return [];
    const out: PostSummary[] = [];
    for (const child of postsDir.children) {
      if (child.type !== 'dir') continue;
      const article = child.children.find(
        (c) => c.type === 'file' && c.name === 'article.svx',
      );
      if (!article) continue;
      const cover = child.children.find(
        (c) => c.type === 'file' && c.name.startsWith('cover.'),
      );
      out.push({
        slug: child.name,
        articlePath: article.path,
        coverPath: cover?.path ?? null,
      });
    }
    return out.sort((a, b) => a.slug.localeCompare(b.slug));
  });
}

export const postsStore = new PostsStore();

export async function loadPostMeta(
  articlePath: string,
  force = false,
): Promise<void> {
  if (!force && metaCache[articlePath]) return;
  try {
    const text = await readFileRel(articlePath);
    const { fm } = parseDoc(text);
    metaCache[articlePath] = {
      title: typeof fm.title === 'string' ? fm.title : '',
      description: typeof fm.description === 'string' ? fm.description : '',
      date: typeof fm.date === 'string' ? fm.date : '',
      draft: fm.draft === true,
    };
  } catch {
    /* ignore — leave cache empty so UI falls back to slug */
  }
}

export function invalidatePostMeta(articlePath: string): void {
  delete metaCache[articlePath];
}

// Returns the post slug for an article path (e.g. 'posts/why-astro/article.svx'
// → 'why-astro'). Returns null if the path isn't a post article.
export function slugFromArticlePath(path: string | null | undefined): string | null {
  if (!path) return null;
  const segs = path.split('/');
  if (segs.length !== 3 || segs[0] !== 'posts' || segs[2] !== 'article.svx') {
    return null;
  }
  return segs[1];
}

// Display label for a post article — title from frontmatter cache when
// available, slug as fallback. Used by TabBar and Command Palette so users
// can tell posts apart at a glance instead of seeing a wall of "article.svx".
// PURE read: does not trigger loads. Callers that render a list of posts
// should drive `ensurePostMeta(path)` from a `$effect` so the cache fills
// without mutating $state during a derived/render pass.
export function postLabelFor(articlePath: string): string {
  const slug = slugFromArticlePath(articlePath);
  if (!slug) return articlePath.split('/').pop() ?? articlePath;
  return metaCache[articlePath]?.title || slug;
}

// Kick off a metadata load for a post article if the cache is empty.
// Safe to call every render — `loadPostMeta` short-circuits when cached.
export function ensurePostMeta(articlePath: string): void {
  if (!slugFromArticlePath(articlePath)) return;
  if (metaCache[articlePath]) return;
  void loadPostMeta(articlePath);
}

// ---------- post-level CRUD wrappers ----------

const STUB_ARTICLE = (slug: string) => `---
title: "${slug}"
description: ""
date: ${new Date().toISOString().slice(0, 10)}
draft: true
---

`;

// Slugs are URL segments and directory names — keep them safe.
const SLUG_OK = /^[a-z0-9][a-z0-9-]*$/;

export function isValidSlug(s: string): boolean {
  return SLUG_OK.test(s);
}

// Create a new post at `posts/<slug>/article.svx` with a starter frontmatter
// body. Throws if the slug is invalid or already exists.
export async function createPost(slug: string): Promise<string> {
  const s = slug.trim();
  if (!isValidSlug(s)) {
    throw new Error('slug 只能用小寫英文、數字、連字號，且不能以連字號開頭');
  }
  if (postsStore.list.some((p) => p.slug === s)) {
    throw new Error(`slug 「${s}」 已存在`);
  }
  await createDir('posts', s);
  const articlePath = `posts/${s}/article.svx`;
  // workspace.createFile writes an empty file; we want a frontmatter stub,
  // so go straight to the IO layer.
  await createFileRel(articlePath, STUB_ARTICLE(s));
  await refreshTree();
  return articlePath;
}

export async function renamePost(oldSlug: string, newSlug: string): Promise<string> {
  const ns = newSlug.trim();
  if (!isValidSlug(ns)) {
    throw new Error('slug 只能用小寫英文、數字、連字號');
  }
  if (ns === oldSlug) return `posts/${oldSlug}`;
  if (postsStore.list.some((p) => p.slug === ns)) {
    throw new Error(`slug 「${ns}」 已存在`);
  }
  // workspace.renamePath takes the target's NEW BASENAME (not the new
  // path). Since post dirs live at posts/<slug>, that's just the new slug.
  await renamePath(`posts/${oldSlug}`, ns);
  // Drop stale meta cache entries for the renamed article.
  invalidatePostMeta(`posts/${oldSlug}/article.svx`);
  return `posts/${ns}`;
}

export async function deletePost(slug: string): Promise<void> {
  await deletePath(`posts/${slug}`, true);
  invalidatePostMeta(`posts/${slug}/article.svx`);
}
