import { getI18nConfig, getRequestContext, isI18nEnabled } from "emdash";
import { getDb } from "emdash/runtime";

interface NavigationRow {
  id: string;
  slug: string | null;
  title: string | null;
  published_at: string | null;
  status: string;
  deleted_at: string | null;
  locale: string;
}

export interface PostLink {
  id: string;
  title: string;
}

/** Read live navigation fields without loading bodies, media or taxonomies. */
export async function getPostLinks(): Promise<PostLink[]> {
  const db = (await getDb()).$extendTables<{ ec_posts: NavigationRow }>();
  const locale =
    getRequestContext()?.locale ??
    (isI18nEnabled() ? getI18nConfig()?.defaultLocale : undefined);
  let query = db
    .selectFrom("ec_posts")
    .select(["id", "slug", "title"])
    .where("status", "=", "published")
    .where("deleted_at", "is", null);
  if (locale) query = query.where("locale", "=", locale);
  const rows = await query
    .orderBy("published_at", "desc")
    .orderBy("id", "desc")
    .execute();
  return rows.map((row) => ({
    id: row.slug ?? row.id,
    title: row.title ?? "Untitled",
  }));
}
