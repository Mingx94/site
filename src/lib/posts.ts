import { getEmDashCollection, getEmDashEntry } from "emdash";
import type { PortableTextBlock } from "emdash/client";

export interface Post {
  id: string;
  title: string;
  description?: string;
  date: string;
  updated?: string;
  readingTime: number;
  cover?: string;
  content: PortableTextBlock[];
  draft?: boolean;
}

type EntryData = {
  title?: string;
  excerpt?: string;
  featured_image?: unknown;
  content?: PortableTextBlock[];
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  status?: string;
};

function mediaSrc(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const image = value as Record<string, unknown>;
  if (typeof image.src === "string") return image.src;
  const meta = image.meta as Record<string, unknown> | undefined;
  const key = meta?.storageKey ?? image.id;
  return typeof key === "string" ? `/_emdash/api/media/file/${key}` : undefined;
}

function iso(value: Date | string | null | undefined): string {
  return value ? new Date(value).toISOString() : new Date(0).toISOString();
}

function countReadingTime(content: PortableTextBlock[]): number {
  const text = content
    .flatMap((block) => block.children ?? [])
    .map((span) => span.text ?? "")
    .join(" ");
  const cjkPattern =
    /\p{Script=Han}|\p{Script=Hangul}|\p{Script=Hiragana}|\p{Script=Katakana}/gu;
  const cjk = text.match(cjkPattern)?.length ?? 0;
  const words = text
    .replace(cjkPattern, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200 + cjk / 500));
}

function toPost(entry: { id: string; data: unknown }): Post {
  const data = entry.data as EntryData;
  const content = Array.isArray(data.content) ? data.content : [];
  return {
    id: entry.id,
    title: data.title ?? "Untitled",
    description: data.excerpt,
    date: iso(data.publishedAt),
    updated: data.updatedAt ? iso(data.updatedAt) : undefined,
    readingTime: countReadingTime(content),
    cover: mediaSrc(data.featured_image),
    content,
    draft: data.status === "draft",
  };
}

export async function getPosts(): Promise<Post[]> {
  const { entries, error } = await getEmDashCollection("posts", {
    status: "published",
    orderBy: { published_at: "desc" },
  });
  if (error) throw error;
  return entries.map(toPost);
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const { entry, error } = await getEmDashEntry("posts", slug);
    if (error) throw error;
    return entry ? toPost(entry) : null;
  } catch (error) {
    if (error instanceof Error && error.name === "LiveEntryNotFoundError")
      return null;
    throw error;
  }
}
