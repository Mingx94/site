import { readFile, access } from "node:fs/promises";
import { join } from "node:path";

export async function verifyStaticBuild() {
  const snapshot = JSON.parse(
    await readFile("build/published-posts.json", "utf8"),
  );
  const root = "dist/static-build/client";
  for (const file of [
    "index.html",
    "404.html",
    "blog.html",
    "tags.html",
    "rss.xml",
    "sitemap.xml",
    "robots.txt",
    "llms.txt",
    "_headers",
  ]) {
    await access(join(root, file));
  }
  for (const [file, path] of [
    ["index.html", "/"],
    ["blog.html", "/blog"],
    ["about.html", "/about"],
  ]) {
    const html = await readFile(join(root, file), "utf8");
    verifyNavigation(html, path);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if (!canonical || new URL(canonical).pathname !== path)
      throw new Error(`Incorrect public canonical URL: ${file}`);
  }
  for (const post of snapshot.posts) {
    if (!/^[^/\\]+$/.test(post.id) || post.id === "." || post.id === "..")
      throw new Error("Invalid article slug");
    const html = await readFile(join(root, "blog", `${post.id}.html`), "utf8");
    verifyNavigation(html, "/blog");
    const markdown = await readFile(
      join(root, "blog", `${post.id}.md`),
      "utf8",
    );
    if (
      !html.includes('id="article-content"') ||
      !markdown.includes(post.title)
    )
      throw new Error(`Incomplete static article: ${post.id}`);
    for (const tag of post.tags)
      await access(join(root, "tags", `${tag.slug}.html`));
  }
  console.log(
    `Verified static output for ${snapshot.posts.length} published posts`,
  );
}

function verifyNavigation(html, activePath) {
  const nav = html.match(
    /<nav\b[^>]*aria-label="主要導覽"[^>]*>([\s\S]*?)<\/nav>/,
  )?.[1];
  const activeLinks =
    nav?.match(/<a\b(?=[^>]*aria-current="page")[^>]*>/g) ?? [];
  if (
    activeLinks.length !== 1 ||
    !activeLinks[0].includes(`href="${activePath}"`)
  )
    throw new Error(`Incorrect active navigation: ${activePath}`);
}
