import { portableTextToMarkdown } from "emdash/client";
import type { Post } from "./posts";

export function postToMarkdown(post: Post): string {
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    `description: ${JSON.stringify(post.description ?? "")}`,
    `date: ${post.date.slice(0, 10)}`,
    ...(post.updated ? [`updated: ${post.updated.slice(0, 10)}`] : []),
    "---",
  ];
  return `${frontmatter.join("\n")}\n\n${portableTextToMarkdown(post.content)}\n`;
}
