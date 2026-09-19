import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { Kysely, SqliteDialect } from "kysely";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "emdash";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn<() => Promise<Kysely<Database>>>(),
  locale: vi.fn<() => string | undefined>(),
}));
vi.mock("emdash/runtime", () => ({ getDb: mocks.getDb }));
vi.mock("emdash", () => ({
  getRequestContext: () => ({ locale: mocks.locale() }),
  isI18nEnabled: () => true,
  getI18nConfig: () => ({ defaultLocale: "zh-TW" }),
}));
import { getPostLinks } from "./postNavigation";

let db: Kysely<Database>;
let sqlite: DatabaseSync;
beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  // Deliberately omit body/media/taxonomy columns: navigation must not read them.
  sqlite.exec(`CREATE TABLE ec_posts (
    id TEXT PRIMARY KEY, slug TEXT, title TEXT, published_at TEXT,
    status TEXT, deleted_at TEXT, locale TEXT
  );
  INSERT INTO ec_posts VALUES
    ('a','older','Older','2026-09-01','published',NULL,'zh-TW'),
    ('b','newer-b','Newer B','2026-09-02','published',NULL,'zh-TW'),
    ('c','newer-c','Newer C','2026-09-02','published',NULL,'zh-TW'),
    ('d','draft','Draft','2026-09-03','draft',NULL,'zh-TW'),
    ('e','scheduled','Scheduled','2026-09-03','scheduled',NULL,'zh-TW'),
    ('f','deleted','Deleted','2026-09-03','published','2026-09-04','zh-TW'),
    ('g','english','English','2026-09-03','published',NULL,'en');`);
  db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: {
        close: () => sqlite.close(),
        prepare(sql) {
          const statement = sqlite.prepare(sql);
          return {
            reader: statement.columns().length > 0,
            all: (args) => statement.all(...(args as SQLInputValue[])),
            run: (args) => statement.run(...(args as SQLInputValue[])),
            iterate: (args) => statement.iterate(...(args as SQLInputValue[])),
          };
        },
      },
    }),
  });
  mocks.getDb.mockResolvedValue(db);
  mocks.locale.mockReturnValue(undefined);
});
afterEach(() => db.destroy());

describe("post navigation", () => {
  it("only returns live, non-deleted titles in stable publication order", async () => {
    await expect(getPostLinks()).resolves.toEqual([
      { id: "newer-c", title: "Newer C" },
      { id: "newer-b", title: "Newer B" },
      { id: "older", title: "Older" },
    ]);
  });
  it("uses the request locale and reads updated live metadata on the next request", async () => {
    mocks.locale.mockReturnValue("en");
    await expect(getPostLinks()).resolves.toEqual([
      { id: "english", title: "English" },
    ]);
    sqlite.exec(
      "UPDATE ec_posts SET title = 'Updated', slug = 'changed' WHERE id = 'g'",
    );
    await expect(getPostLinks()).resolves.toEqual([
      { id: "changed", title: "Updated" },
    ]);
  });
  it("retains the ID and title fallback used by the content loader", async () => {
    sqlite.exec("UPDATE ec_posts SET slug = NULL, title = NULL WHERE id = 'a'");
    expect((await getPostLinks()).at(-1)).toEqual({
      id: "a",
      title: "Untitled",
    });
  });
});
