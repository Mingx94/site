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
  for (const post of snapshot.posts) {
    if (!/^[^/\\]+$/.test(post.id) || post.id === "." || post.id === "..")
      throw new Error("Invalid article slug");
    const html = await readFile(join(root, "blog", `${post.id}.html`), "utf8");
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
