# Vartifact

[vartifact.cc](https://vartifact.cc) — Michael Tsai 的個人部落格，分享技術與生活。

## 技術棧

- Astro 7 server output + Cloudflare Workers
- EmDash CMS，D1 儲存內容，R2 儲存媒體
- Astro components with native browser scripts
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

## 本機開發

需要 Node.js 22.19 或更新版本。以下指令使用 PowerShell。

```powershell
Remove-Item Env:CLOUDFLARE_ENV -ErrorAction SilentlyContinue
npm ci
npm run dev
```

開發伺服器預設使用 `http://localhost:4321`。首次使用請先完成[本機初始化](docs/deployment.md#本機初始化)，包含 EmDash setup 與 `site_counters` 資料表，才能正常開啟文章頁。預設使用本機資料；選用 preview 環境會連到遠端 preview 資源。

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動 Astro 開發伺服器 |
| `npm run check` | 格式、lint、型別與無障礙檢查 |
| `npm run format` | 用 Oxfmt 格式化支援的檔案 |
| `npm run lint` | 用 Oxlint 檢查程式碼 |
| `npm test` | 執行 Vitest |
| `npm run build` | 建立 production Worker |
| `npm run cf-typegen` | 產生 Cloudflare binding 型別 |
| `npm run deploy` | 建置並部署 Worker |

Cloudflare 資源、備份、部署與回復步驟請見 [部署指南](docs/deployment.md)。

## 內容管理

文章由 EmDash 的 `posts` collection 管理。登入 `/_emdash/admin` 可編輯、預覽、排程與發布文章。公開文章保留 HTML、Markdown、RSS 與 sitemap 輸出。

聯絡頁使用 EmDash Forms 的 `contact` 表單，需另外設定表單、Turnstile 與寄信通知，詳見[聯絡表單](docs/deployment.md#聯絡表單)。瀏覽次數存於 D1 的 `site_counters`；KV 提供舊計數讀取與瀏覽去重。

## 專案結構

```text
.emdash/seed.json       初始 schema 與遷移內容
migrations/             專案資料修正 migration
public/                 靜態資產
src/components/         Astro 元件
src/layouts/            Astro layout
src/lib/                內容與 Cloudflare helper
src/pages/              Astro 頁面與 API routes
src/live.config.ts      EmDash live collection
src/worker.ts           Astro + EmDash Worker entry
```

Oxfmt 目前不支援 `.astro` 檔案，因此格式化指令會跳過這些檔案。`npm run check` 仍會用 Astro 檢查其 TypeScript 與無障礙問題。

## License

[MIT](LICENSE) © Michael Tsai
