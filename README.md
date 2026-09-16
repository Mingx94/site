# Vartifact

[vartifact.cc](https://vartifact.cc) — Michael Tsai 的個人部落格，分享技術與生活。

## 技術棧

- Astro 7 server output + Cloudflare Workers
- EmDash CMS，D1 儲存內容，R2 儲存媒體
- Astro components with native browser scripts
- Native CSS

## 路由

| 路徑 | 說明 |
| --- | --- |
| `/` | 首頁 |
| `/blog` | 文章列表 |
| `/blog/[slug]` | 文章內頁 |
| `/blog/[slug].md` | 文章 Markdown 版本 |
| `/about` | 關於 |
| `/tags`、`/tags/[tag]` | 標籤索引與文章分類 |
| `/showcase` | 作品展示；沒有作品時隱藏導覽與首頁區塊 |
| `/rss.xml`、`/sitemap.xml` | 訂閱與 SEO |
| `/llms.txt` | LLM 可讀索引 |
| `/_emdash/admin` | EmDash 管理介面 |

## 本機開發

需要 Node.js 22.19 或更新版本。以下指令使用 PowerShell。

```powershell
npm ci
npm run dev
```

開發伺服器預設使用 `http://localhost:4321`。首次使用請先完成[本機初始化](docs/deployment.md#本機初始化)的 EmDash setup，才能正常開啟文章頁。本機開發使用本機 D1 與 R2 資料。

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

文章由 EmDash 的 `posts` collection 管理。登入 `/_emdash/admin` 可編輯、排程與發布文章。公開文章保留 HTML、Markdown、RSS 與 sitemap 輸出。

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

## 設計來源

前台移植自 [Astro Sienna](https://github.com/anjay-goel/astro-sienna)，參考版本為 `c5ea7eed5b1bab37ac1b730da32387355fdefdf2`。首頁、文章時間軸、文章內頁、關於、標籤、作品與 404 頁沿用原版的結構、配色、間距、動畫與響應式規則。

依專案需求，字體全部改用作業系統內建字體，不下載 Google Fonts 或其他網頁字體，也不提供字體切換。文字、文章網址、作者資訊與內容保留 Vartifact 的設定；文章由 EmDash 管理，部署沿用 Cloudflare Workers。第三方授權聲明見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

標籤讀取 EmDash 的 `terms.tag`。作品資料放在 `src/data/showcase.ts`，空陣列會隱藏首頁作品區與導覽。程式碼區塊使用原版的 Expressive Code 主題，提供語法上色、檔名與複製按鈕；`mermaid` 語言的程式碼區塊會延遲載入圖表。文章提供分享、段落連結、閱讀進度與回到頁首。

本專案保留 EmDash 的 Portable Text 內容模型，不改成原版的 MDX 編輯流程。原版的 KaTeX Markdown 語法、建置時產生的 OG 圖片，以及需另設帳號的 Giscus、Webmentions、GA4、GoatCounter 未啟用；社群預覽沿用 EmDash SEO 與封面，流量分析沿用 Cloudflare Web Analytics。

## License

[MIT](LICENSE) © Michael Tsai
