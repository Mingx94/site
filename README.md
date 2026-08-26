# Vartifact

[vartifact.cc](https://vartifact.cc) — Michael Tsai 的個人部落格，分享技術與生活。

## 技術棧

- Astro 7 server output + Cloudflare Workers
- EmDash CMS，D1 儲存內容，R2 儲存媒體
- Svelte 5 interactive islands
- Native CSS
- Cloudflare KV、Rate Limiting、Email Routing 與 Turnstile

## 路由

| 路徑 | 說明 |
| --- | --- |
| `/` | 首頁 |
| `/blog` | 文章列表 |
| `/blog/[slug]` | 文章內頁 |
| `/blog/[slug].md` | 文章 Markdown 版本 |
| `/about` | 關於 |
| `/contact` | 聯絡表單 |
| `/rss.xml`、`/sitemap.xml` | 訂閱與 SEO |
| `/llms.txt` | LLM 可讀索引 |
| `/_emdash/admin` | EmDash 管理介面 |

## 本地開發

```bash
npm install
npm run dev
```

開發伺服器預設使用 `http://localhost:4321`。第一次開啟網站時，EmDash 會建立本機資料庫並套用 `.emdash/seed.json`。

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動 Astro 開發伺服器 |
| `npm run check` | 型別與無障礙檢查 |
| `npm test` | 執行 Vitest |
| `npm run build` | 建立 production Worker |
| `npm run cf-typegen` | 產生 Cloudflare binding 型別 |
| `npm run deploy` | 建置並部署 Worker |

Cloudflare 資源、備份、部署與回復步驟請見 [部署指南](docs/deployment.md)。

## 內容管理

文章由 EmDash 的 `posts` collection 管理。登入 `/_emdash/admin` 可編輯、預覽、排程與發布文章。公開文章保留 HTML、Markdown、RSS 與 sitemap 輸出。

## 專案結構

```text
.emdash/seed.json       初始 schema 與遷移內容
migrations/             專案資料修正 migration
public/                 靜態資產
src/components/         Svelte islands
src/layouts/            Astro layout
src/lib/                內容與 Cloudflare helper
src/pages/              Astro 頁面與 API routes
src/live.config.ts      EmDash live collection
src/worker.ts           Astro + EmDash Worker entry
```

## License

[MIT](LICENSE) © Michael Tsai
