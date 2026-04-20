// Build-time OG image generator.
//
// Previously the Worker ran `@vercel/og` at request time under a prerendered
// route (`src/routes/og/[...slug]/+server.ts`), which pulled React +
// react-dom + @vercel/og into the Cloudflare bundle. This script generates
// the same JPGs at build time into `static/og/<slug>.png`, so the Worker
// serves them as plain static assets (no runtime, no React).
//
// Runs via `tsx scripts/gen-og.ts` as a `prebuild` step.

import { readdir, readFile, writeFile, mkdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import { generateOgImageForPost } from "../src/lib/generateOgImages";

const POSTS_DIR = "src/content/posts";
const OUT_DIR = "static/og";

type PostMeta = {
  slug: string;
  title: string;
  description: string | undefined;
  draft: boolean;
};

async function readPosts(): Promise<PostMeta[]> {
  const entries = await readdir(POSTS_DIR, { withFileTypes: true });
  const posts: PostMeta[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const articlePath = join(POSTS_DIR, entry.name, "article.svx");
    try {
      const src = await readFile(articlePath, "utf8");
      const { data } = matter(src);
      const title = typeof data.title === "string" ? data.title : entry.name;
      const description =
        typeof data.description === "string" ? data.description : undefined;
      const draft = data.draft === true;
      posts.push({ slug: entry.name, title, description, draft });
    } catch {
      // No article.svx in this dir — not a post.
    }
  }
  return posts;
}

async function cleanStale(publishedSlugs: Set<string>): Promise<void> {
  try {
    const files = await readdir(OUT_DIR);
    for (const f of files) {
      if (!f.endsWith(".png")) continue;
      const slug = f.slice(0, -4);
      if (!publishedSlugs.has(slug)) {
        await unlink(join(OUT_DIR, f));
        console.log(`[og] removed stale ${f}`);
      }
    }
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") throw e;
  }
}

async function needsRebuild(
  outPath: string,
  articlePath: string,
): Promise<boolean> {
  try {
    const [o, a] = await Promise.all([stat(outPath), stat(articlePath)]);
    return a.mtimeMs > o.mtimeMs;
  } catch {
    return true; // missing output → build it
  }
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });

  const posts = await readPosts();
  const published = posts.filter((p) => !p.draft);
  const publishedSet = new Set(published.map((p) => p.slug));

  await cleanStale(publishedSet);

  let built = 0;
  let skipped = 0;
  for (const post of published) {
    const outPath = join(OUT_DIR, `${post.slug}.png`);
    const articlePath = join(POSTS_DIR, post.slug, "article.svx");
    if (!(await needsRebuild(outPath, articlePath))) {
      skipped++;
      continue;
    }

    const res = await generateOgImageForPost({
      title: post.title,
      description: post.description,
    });
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(outPath, buf);
    console.log(`[og] built ${post.slug}.png (${buf.byteLength} bytes)`);
    built++;
  }

  console.log(`[og] ${built} built, ${skipped} up-to-date`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
