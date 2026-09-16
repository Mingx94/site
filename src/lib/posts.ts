import { getEmDashCollection, getEmDashEntry } from "emdash";
import type { ContentSeo, TaxonomyTerm } from "emdash";
import type { PortableTextBlock } from "emdash/client";
import { getLocalCoverSource } from "./coverVariants";
import { getReadingTime } from "./readingTime";

export interface Post {
  id: string;
  title: string;
  description?: string;
  date: string;
  updated?: string;
  readingTime: number;
  cover?: string;
  coverAlt?: string;
  coverMediaId?: string;
  coverStorageKey?: string;
  seo?: ContentSeo;
  content: PortableTextBlock[];
  draft?: boolean;
  tags: PostTag[];
}

export interface PostTag {
  slug: string;
  name: string;
}

type EntryData = {
  title?: string;
  excerpt?: string;
  featured_image?: unknown;
  seo?: ContentSeo;
  content?: PortableTextBlock[];
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  status?: string;
  terms?: Record<string, TaxonomyTerm[]>;
};

function media(
  value: unknown,
): Pick<Post, "cover" | "coverAlt" | "coverMediaId" | "coverStorageKey"> {
  if (!value || typeof value !== "object") return {};
  const image = value as Record<string, unknown>;
  const coverAlt = typeof image.alt === "string" ? image.alt : undefined;
  if (typeof image.src === "string") return { cover: image.src, coverAlt };
  const source = getLocalCoverSource(image);
  return source
    ? {
        cover: `/_emdash/api/media/file/${source.storageKey}`,
        coverAlt,
        coverMediaId: source.mediaId,
        coverStorageKey: source.storageKey,
      }
    : {};
}

function iso(value: Date | string | null | undefined): string {
  return value ? new Date(value).toISOString() : new Date(0).toISOString();
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
    readingTime: getReadingTime(content),
    ...media(data.featured_image),
    seo: data.seo,
    content,
    draft: data.status === "draft",
    tags: (data.terms?.tag ?? []).map((term) => ({
      slug: term.slug,
      name: term.label,
    })),
  };
}

export function getTags(posts: Post[]): (PostTag & { count: number })[] {
  const tags = new Map<string, PostTag & { count: number }>();
  for (const post of posts) {
    const seen = new Set<string>();
    for (const tag of post.tags) {
      if (seen.has(tag.slug)) continue;
      seen.add(tag.slug);
      const existing = tags.get(tag.slug);
      if (existing) existing.count += 1;
      else tags.set(tag.slug, { ...tag, count: 1 });
    }
  }
  return [...tags.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "zh-TW"),
  );
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
