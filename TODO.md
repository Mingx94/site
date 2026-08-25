# Astro + EmDash 遷移 TODO

## 目標架構

- [ ] 使用同一個 repository、Astro build 與 Cloudflare Worker 部署前台和 EmDash。
- [ ] 保留 `/_emdash/admin` 與 `/_emdash/api/*` 作為管理介面及 CMS API。
- [ ] 使用 D1 儲存 EmDash 內容，使用 R2 儲存媒體。
- [ ] 保留既有 `BLOG_KV`、`BLOG_RATE`、`SEND_EMAIL` 與 Turnstile 功能。
- [ ] 保留現有公開 URL，不改用 EmDash template 的 `/posts/*` 路徑。
- [ ] 第一階段不啟用 sandboxed plugins 或 Worker Loader。

## 1. 建立 Astro 與 EmDash 基礎

- [ ] 將 SvelteKit 應用外殼改成 Astro server output。
- [ ] 加入 Astro、Cloudflare adapter、EmDash、React 與 React integration。
- [ ] 暫時保留 Svelte 5，使用 Astro Svelte integration 承接互動元件。
- [ ] 建立 `astro.config.mjs`，註冊 React、Svelte、EmDash、D1 與 R2。
- [ ] 建立 `src/live.config.ts`，註冊 EmDash Live Collection loader。
- [ ] 建立 `src/worker.ts`，整合 Astro handler 與 EmDash scheduled handler。
- [ ] 更新 `package.json` scripts、TypeScript 設定與 lockfile。
- [ ] 將 `static/` 資產遷移到 Astro 的 `public/`。

## 2. 整合 Cloudflare 資源

- [ ] 建立正式環境 D1 database 與 R2 bucket。
- [ ] 更新 `wrangler.jsonc` 的 Worker entry、D1、R2 與 cron triggers。
- [ ] 保留現有 KV namespace、rate limit、email、Turnstile 與 observability 設定。
- [ ] 建立並備份 `EMDASH_ENCRYPTION_KEY` Worker secret。
- [ ] 確認不需要 sandboxed plugins，省略 `worker_loaders` 設定。
- [ ] 為 preview／staging 建立獨立 D1 與 R2，避免污染正式內容。
- [ ] 定義 D1 migration、部署順序、失敗回復與內容備份流程。

## 3. 遷移應用外殼與路由

- [ ] 將 `src/app.html` 與 `src/routes/+layout.svelte` 改成 Astro base layout。
- [ ] 將全站 head、SEO、字型、analytics、skip link、Header 與 Footer 移到 Astro layout。
- [ ] 將首頁改成 `src/pages/index.astro`。
- [ ] 將文章列表改成 `src/pages/blog/index.astro`。
- [ ] 將文章頁改成 `src/pages/blog/[slug].astro`，並使用 EmDash live query。
- [ ] 將 About、Contact 與 404 頁改成 Astro routes。
- [ ] 保留 `/`、`/blog`、`/blog/[slug]`、`/about` 與 `/contact` 的既有行為。
- [ ] 只讓需要瀏覽器互動的元件 hydration。
- [ ] 保留現有 CSS tokens、全站樣式、文章樣式與視覺語言。

## 4. 遷移文章與媒體

- [ ] 建立 `posts` collection，至少包含 `title`、`excerpt`、`featured_image` 與 `content`。
- [ ] 將文章日期映射到 `publishedAt`，更新日期映射到 `updatedAt`。
- [ ] 將 `draft` 映射到 EmDash entry status。
- [ ] 將 `cover.jpg` 上傳到 R2，並設為 `featured_image`。
- [ ] 將 `.svx` 正文轉成 Portable Text。
- [ ] 繼續於查詢後計算 reading time，不在資料庫重複儲存。
- [ ] 只在實際需要時加入 `dropCap` 自訂欄位。
- [ ] 驗證文章 slug 與既有公開 URL 完全一致。
- [ ] 完成內容比對後，再移除舊的 `src/content/posts` 與 `src/lib/posts.ts` 路徑。

## 5. 保留既有動態功能

- [ ] 將 views query／command 改成 Astro API endpoint。
- [ ] 將 article reactions 改成 Astro API endpoint。
- [ ] 繼續使用既有 slug-based KV keys，保留目前的計數資料。
- [ ] 保留 per-IP dedup 與 `BLOG_RATE` 限制。
- [ ] 更新 `ReactionBar`，改用新 API，不依賴 SvelteKit remote functions。
- [ ] 第一階段保留現有聯絡表單資料模型、Turnstile 驗證、KV 儲存與 email 通知。
- [ ] 將聯絡表單 server logic 改成 Astro endpoint。
- [ ] 等核心遷移穩定後，再決定是否改用 EmDash Forms。

## 6. 文章元件與互動

- [ ] 先確認實際文章是否使用 Accordion、Notice、Tabs、Video、Figure 等自訂元件。
- [ ] 不為目前未使用的元件預先建立 EmDash plugin。
- [ ] 有實際內容需求時，再建立 Portable Text custom block 與 Astro renderer。
- [ ] 評估哪些元件暫時保留為 Svelte islands：主題、字體、文章搜尋、TOC、返回頂部與 reactions。
- [ ] 移除或改寫 `$app/state`、`$app/server`、`$app/environment` 與 SvelteKit page data 依賴。
- [ ] 最後再評估是否值得將剩餘 Svelte 元件改成純 Astro。

## 7. SEO 與機器可讀端點

- [ ] 將 SvelteKit hooks 改成 Astro middleware。
- [ ] 移植 CSP、HSTS、Permissions Policy 與其他安全 headers。
- [ ] 保留文章頁的 `Accept: text/markdown` content negotiation 與 `Vary: Accept`。
- [ ] 重建 `/blog/[slug].md`，將 Portable Text 轉成 Markdown。
- [ ] 重建 `/rss.xml`、`/sitemap.xml`、`/robots.txt` 與 `/llms.txt`。
- [ ] 保留 `/.well-known/security.txt`。
- [ ] 決定要補上 `/.well-known/agent-skills/index.json`，或移除 README 中的現有宣稱。
- [ ] 重新驗證 `_headers` 在 Astro／Workers Assets 下的檔案位置與生效範圍。
- [ ] 文章 OG 圖第一階段使用 featured image 或全站 fallback。
- [ ] 只有確認需要品牌化文字 OG 時，才實作 publish hook 或動態 OG endpoint。

## 8. 驗證與切換

- [ ] 執行 Astro type／accessibility check。
- [ ] 保留並執行可沿用的 Vitest 純函式測試。
- [ ] 重寫 SvelteKit route 與 security header 測試。
- [ ] 完成 production build。
- [ ] 使用 Wrangler 和真實 bindings 驗證 D1、R2、KV、rate limit、email 與 Turnstile。
- [ ] 驗證 EmDash setup、admin login、文章編輯、draft preview、publish 與 revision。
- [ ] 驗證首頁、文章列表、文章頁、About、Contact 與 404。
- [ ] 驗證 RSS、sitemap、robots、llms、Markdown alternate 與 security.txt。
- [ ] 驗證 light／dark theme、鍵盤操作、響應式版面與 reduced motion。
- [ ] 驗證既有 views 與 reactions 資料沒有重設。
- [ ] 更新 README、PRODUCT、部署指南與 AGENTS 文件。
- [ ] 保留舊部署的可回復版本，完成正式 smoke test 後才切換流量。

## 延後項目

- [ ] EmDash Forms 取代自訂聯絡表單。
- [ ] Sandboxed plugin marketplace 與 Dynamic Workers。
- [ ] 自訂 Portable Text block plugin。
- [ ] 將所有 Svelte 元件改成純 Astro。
- [ ] D1 read replicas、KV object cache 或額外搜尋服務；只有量測顯示需要時才加入。
