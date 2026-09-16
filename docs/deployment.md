# Cloudflare 部署

本專案由一個 Astro Worker 提供公開網站與 EmDash。以下指令使用 PowerShell，從專案根目錄執行。

## 前置需求

- Node.js 22.19 或更新版本
- `npm ci`
- 操作遠端資源前先執行 `npx wrangler login`

## 環境與資源

資源名稱與 IDs 以 `wrangler.jsonc` 為準，不要重複建立。

| 環境       | 選擇方式                   | 資料目的地                         |
| ---------- | -------------------------- | ---------------------------------- |
| 本機       | 執行 `npm run dev`         | 本機模擬的 D1、R2                  |
| Production | 使用預設 Wrangler 設定部署 | `blog-emdash`、`blog-emdash-media` |

網站只由 `https://vartifact.cc` 提供服務。`workers.dev` 與版本預覽網址皆已關閉。

## Secrets

首次設定時，產生 `EMDASH_ENCRYPTION_KEY`，存入密碼管理器，再寫入 Worker。既有環境沿用原 key，不要在日常部署時重新產生或覆寫：

```powershell
npx emdash secrets generate
npx wrangler secret put EMDASH_ENCRYPTION_KEY
```

本機 secret 放在未追蹤的 `.dev.vars`。搬移含加密設定的資料時，需確認原 key 的相容性，不能直接換成新 key。不要提交任何 secret。

## 本機初始化

```powershell
npm ci
npm run dev
```

開啟 `http://localhost:4321/_emdash/admin`，完成 EmDash setup，確認 schema 與 `.emdash/seed.json` 的文章已載入。

### 一次性歷史日期修正

`0001-content-dates.sql` 會覆寫 `why-astro` 的發布與更新日期。只有新載入舊 seed、且確認需要還原歷史日期時才執行：

```powershell
npx wrangler d1 execute blog-emdash --local --file migrations/0001-content-dates.sql
```

遠端首次遷移若需要此修正，先備份，再明確選擇對應資料庫與環境。既有文章已在 CMS 更新日期時，不要重跑。

## 日常正式部署

1. 記錄正式 D1 Time Travel bookmark、從 EmDash Admin 下載內容備份，並另外備份 R2 objects。EmDash 使用 FTS5 virtual tables，不要把未驗證可用的完整 D1 SQL 匯出當成唯一備份。
2. 記錄目前 active deployment 與可回復的 Worker version ID，確認舊版本能使用部署後的資料結構。
3. 重新檢查並建置。
4. 部署後立即執行 smoke test。此流程會直接更新正式 Worker。

```powershell
npx wrangler deployments list
npx wrangler d1 time-travel info blog-emdash --json
npm ci
npm run check
npm test
npm run build
npx wrangler deploy --dry-run
npx wrangler deploy
```

每個步驟成功後才執行下一步。備份與版本紀錄需另外保存。日常部署不執行 `0001-content-dates.sql`，也不重新初始化 CMS 或 secrets。

### Smoke test

- 公開首頁、文章列表、文章頁與不存在的路徑。
- EmDash 登入、文章編輯與發布、媒體上傳及讀取；首次部署才測 setup。
- Markdown、RSS、sitemap、robots、llms 與 security.txt 輸出。

記錄 Worker version 與驗證結果。

## 回復

先確認問題是否只在程式碼，以及舊 Worker 是否相容目前資料結構。將佔位值換成部署前記錄的 version ID：

```powershell
npx wrangler rollback <WORKER_VERSION_ID>
```

Worker rollback 不會還原 D1 或 R2 資料。回復後重新驗證受影響功能。詳見 [Cloudflare Worker rollback 文件](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)。

若確定需要還原 D1，先停止相關寫入、保存現況並確認 bookmark 仍在可回復期間，再代入部署前記錄的 bookmark：

```powershell
npx wrangler d1 time-travel restore blog-emdash --bookmark=<PRE_DEPLOY_BOOKMARK>
```

Time Travel 會覆寫整個資料庫，包含 bookmark 之後新增的文章與表單資料。保存回復結果中的 previous bookmark，並檢查 D1 與 R2 是否一致。詳見 [D1 Time Travel 文件](https://developers.cloudflare.com/d1/reference/time-travel/)。

R2 只還原確認受影響的 objects，避免覆寫正常的新內容。
