# Cloudflare 部署

本專案由一個 Astro Worker 同時提供公開網站與 EmDash。正式環境使用 `DB` D1 database 與 `MEDIA` R2 bucket；preview 必須使用不同資源。

## 前置需求

- Node.js 22.19 或更新版本
- `npm ci`
- `npx wrangler login`

## Cloudflare 資源

Production 與 preview 的 D1、R2 和隔離 KV 已建立，resource IDs 記錄在 `wrangler.jsonc`。不要重複建立同名資源。

Preview Worker 已部署至 `https://blog-preview.vartifact.workers.dev`，並使用獨立資源與 `EMDASH_ENCRYPTION_KEY`。

正式環境保留既有的 `BLOG_KV`、`BLOG_RATE`、`SEND_EMAIL` 與 Turnstile bindings。Preview 設定不得重用正式 D1、R2 或可寫入正式資料的 KV。

## Secrets

產生一次 EmDash encryption key，存入密碼管理器，再設定 Worker secret。不要提交 key。

```bash
npx emdash secrets generate
npx wrangler secret put EMDASH_ENCRYPTION_KEY
```

Production 已有 `TURNSTILE_SECRET_KEY`。Preview Worker 首次部署後，再以 `--env preview` 設定同一把 `EMDASH_ENCRYPTION_KEY`；只有要測試 preview 聯絡表單時，才另外設定 preview Turnstile secret。

本機 secret 放在未追蹤的 `.dev.vars`。

## 本機驗證

```bash
npm run check
npm test
npm run build
npx wrangler dev
```

第一次開啟 `/_emdash/admin` 時，EmDash 會建立 schema 並載入 `.emdash/seed.json`。確認範例文章後，套用歷史日期修正：

```bash
npx wrangler d1 execute blog-emdash --local --file migrations/0001-content-dates.sql
```

## 正式部署

1. 記錄正式 D1 Time Travel bookmark、從 EmDash Admin 下載內容備份，並另外備份 R2 objects。
2. 記錄目前可回復的 Worker version。
3. 執行檢查、測試與建置。
4. 部署 Worker，讓 EmDash 套用內建 migration 與 seed。
5. 套用 `migrations/0001-content-dates.sql`。
6. 完成 smoke test 後才切換自訂網域流量。

本次部署前記錄的 production Worker 是 version 57（`57a3324c-8fde-40ae-b02f-a6e04d0aebad`，2026-08-26）。每次部署前仍應再確認一次目前版本。

EmDash 使用 FTS5 virtual tables，因此 Wrangler 目前無法匯出完整 D1 SQL。部署前必須記錄 Time Travel bookmark，並保留 EmDash 與 R2 備份。

```bash
npx wrangler d1 time-travel info blog-emdash --json
npm ci
npm run check
npm test
npm run build
npx wrangler deploy
npx wrangler d1 execute blog-emdash --remote --file migrations/0001-content-dates.sql
```

Smoke test 必須涵蓋 EmDash setup/login、文章編輯與發布、D1/R2、views/reactions、聯絡表單、公開頁面、Markdown、RSS、sitemap、robots、llms 與 security.txt。

## 回復

若 smoke test 失敗，先將流量切回舊 Worker version，再調查資料問題：

```bash
npx wrangler rollback
```

D1 只在確認需要時才由部署前匯出檔還原。R2 使用部署前複製的 objects 還原，避免把正常的新內容一起覆寫。
