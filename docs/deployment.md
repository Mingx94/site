# Cloudflare 部署

本專案由一個 Astro Worker 提供公開網站與 EmDash。以下指令使用 PowerShell，從專案根目錄執行。

## 前置需求

- Node.js 22.19 或更新版本
- `npm ci`
- 操作遠端資源前先執行 `npx wrangler login`

## 環境與資源

資源名稱與 IDs 以 `wrangler.jsonc` 為準，不要重複建立。

| 環境       | 選擇方式                                                       | 資料目的地                                                   |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| 本機       | 清除 `CLOUDFLARE_ENV` 後執行 `npm run dev`                     | 本機模擬的 D1、R2、KV                                        |
| Preview    | 設定 `CLOUDFLARE_ENV=preview`；Wrangler 指令加 `--env preview` | `blog-emdash-preview`、`blog-emdash-media-preview` 與獨立 KV |
| Production | 清除 `CLOUDFLARE_ENV`，使用預設部署設定                        | `blog-emdash`、`blog-emdash-media` 與正式 KV                 |

Preview 的 D1、R2、KV 設為 `remote: true`。從本機啟動 preview 開發伺服器，也可能修改遠端 preview 資料。`npm run preview` 是 Astro 建置預覽指令，不代表選用 Cloudflare preview 環境。

`astro.config.mjs` 依建置時的 `CLOUDFLARE_ENV` 決定網站網址：preview 使用 `https://blog-preview.vartifact.workers.dev`，其餘使用 `https://vartifact.cc`。切換環境後必須重新建置。

目前 preview 區塊僅明列 D1、R2、KV。測試寄信、Turnstile 或限流前，需確認該環境的 `SEND_EMAIL`、`TURNSTILE_SITE_KEY`、`TURNSTILE_SECRET_KEY` 與 `BLOG_RATE` 設定。

## Secrets

新環境首次設定時，產生該環境專用的 `EMDASH_ENCRYPTION_KEY`，存入密碼管理器，再寫入對應 Worker。既有環境沿用原 key，不要在日常部署時重新產生或覆寫。以下依目標環境擇一設定：

```powershell
npx emdash secrets generate
# Production
npx wrangler secret put EMDASH_ENCRYPTION_KEY
# Preview：使用 preview 自己的 key
npx wrangler secret put EMDASH_ENCRYPTION_KEY --env preview
```

聯絡表單另需目標環境的 `TURNSTILE_SECRET_KEY`。本機 secret 放在未追蹤的 `.dev.vars`，不要放入正式環境的 key。搬移含加密設定的資料時，需確認原 key 的相容性，不能直接換成新 key。不要提交任何 secret。

## 本機初始化

```powershell
Remove-Item Env:CLOUDFLARE_ENV -ErrorAction SilentlyContinue
npm ci
npm run dev
```

開啟 `http://localhost:4321/_emdash/admin`，完成 EmDash setup，確認 schema 與 `.emdash/seed.json` 的文章已載入。在另一個終端機建立文章頁必要的計數表：

```powershell
Remove-Item Env:CLOUDFLARE_ENV -ErrorAction SilentlyContinue
npx wrangler d1 execute blog-emdash --local --file migrations/0002-blog-counters.sql
```

`site_counters` 不屬於 EmDash seed，不能略過。完成後開啟文章，確認內容與瀏覽次數正常。

### 一次性歷史日期修正

`0001-content-dates.sql` 會覆寫 `why-astro` 的發布與更新日期。只有新載入舊 seed、且確認需要還原歷史日期時才執行：

```powershell
npx wrangler d1 execute blog-emdash --local --file migrations/0001-content-dates.sql
```

遠端首次遷移若需要此修正，先備份，再明確選擇對應資料庫與環境。既有文章已在 CMS 更新日期時，不要重跑。

## 聯絡表單

`src/pages/contact.astro` 使用 EmDash Forms 的 `<Form id="contact" />`；`.emdash/seed.json` 未包含這份表單設定。

在目標環境的 EmDash Admin 建立或確認識別值為 `contact` 的表單，設定所需欄位、Turnstile 與通知收件人。寄信整合使用 `SEND_EMAIL`，寄件地址為 `michael.tsai@vartifact.cc`；確認 Cloudflare 寄信設定與允許的收件人相符。

先確認 `/contact` 顯示表單，再以測試訊息確認驗證、提交紀錄與通知收信。頁面顯示正常不等於寄信成功。

## Preview 驗證

以下會部署到遠端 preview。先確認該環境的 secrets 與必要 bindings 已設定。每個步驟成功後才執行下一步，失敗時停止。

```powershell
$env:CLOUDFLARE_ENV = "preview"
npm run check
npm test
npm run build
npx wrangler d1 execute blog-emdash-preview --env preview --remote --file migrations/0002-blog-counters.sql
npx wrangler deploy --env preview
Remove-Item Env:CLOUDFLARE_ENV -ErrorAction SilentlyContinue
```

完成後在 preview 網址執行下列 smoke test。首次使用空資料庫時，另外完成 EmDash setup 與表單初始化。

## 日常正式部署

1. 完成 preview 驗證。
2. 記錄正式 D1 Time Travel bookmark、從 EmDash Admin 下載內容備份，並另外備份 R2 objects。EmDash 使用 FTS5 virtual tables，不要把未驗證可用的完整 D1 SQL 匯出當成唯一備份。
3. 記錄目前 active deployment 與可回復的 Worker version ID，確認舊版本能使用部署後的資料結構。
4. 清除 preview 環境，重新檢查與建置。只有新資料庫或尚未建立 `site_counters` 時，才需先套用 `0002-blog-counters.sql`。
5. 部署後立即執行 smoke test。此流程直接更新正式 Worker，不包含另一個「驗證後才切換網域」步驟。

```powershell
Remove-Item Env:CLOUDFLARE_ENV -ErrorAction SilentlyContinue
npx wrangler deployments list
npx wrangler d1 time-travel info blog-emdash --json
npm ci
npm run check
npm test
npm run build
# 僅在尚未建立計數表時執行
npx wrangler d1 execute blog-emdash --remote --file migrations/0002-blog-counters.sql
npx wrangler deploy
```

每個步驟成功後才執行下一步。備份與版本紀錄需另外保存。日常部署不執行 `0001-content-dates.sql`，也不重新初始化 CMS 或 secrets。

### Smoke test

- 公開首頁、文章列表、文章頁與不存在的路徑。
- EmDash 登入、文章編輯與發布、媒體上傳及讀取；首次部署才測 setup。
- 文章 views 的讀取與增加。
- 聯絡表單提交及通知收信。
- Markdown、RSS、sitemap、robots、llms 與 security.txt 輸出。

記錄環境、Worker version 與結果。Preview 通過不等於正式環境已驗證。

## 回復

先確認問題是否只在程式碼，以及舊 Worker 是否相容目前資料結構。將佔位值換成部署前記錄的 version ID：

```powershell
Remove-Item Env:CLOUDFLARE_ENV -ErrorAction SilentlyContinue
npx wrangler rollback <WORKER_VERSION_ID>
```

Worker rollback 不會還原 D1、R2 或 KV 資料。回復後重新驗證受影響功能。詳見 [Cloudflare Worker rollback 文件](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)。

若確定需要還原 D1，先停止相關寫入、保存現況並確認 bookmark 仍在可回復期間，再代入部署前記錄的 bookmark：

```powershell
npx wrangler d1 time-travel restore blog-emdash --bookmark=<PRE_DEPLOY_BOOKMARK>
```

Time Travel 會覆寫整個資料庫，包含 bookmark 之後新增的文章、表單資料與瀏覽次數。保存回復結果中的 previous bookmark，並檢查 D1 與 R2 是否一致。詳見 [D1 Time Travel 文件](https://developers.cloudflare.com/d1/reference/time-travel/)。

R2 只還原確認受影響的 objects，避免覆寫正常的新內容。KV 的去重與舊計數不會隨 D1 回復，需另外評估。
