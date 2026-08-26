# Astro + EmDash 遷移狀態

## Repository

- [x] 將 SvelteKit app shell 改成 Astro 7 server output。
- [x] 整合 EmDash、React、Svelte islands、D1、R2 與 scheduled handler。
- [x] 保留公開 routes、樣式、SEO、Markdown、RSS、sitemap、robots、llms 與 security headers。
- [x] 將文章 schema、Portable Text、日期修正與封面媒體寫成可重複套用的 seed/migration。
- [x] 將 views、reactions 與 contact 改成 Astro API routes，保留既有 KV keys、rate limit、Turnstile 與 email。
- [x] 移除未使用的 SvelteKit、mdsvex、自訂文章元件與 build-time OG 程式碼。
- [x] 更新 README、PRODUCT、部署指南與 AGENTS。
- [x] 通過 seed validation、Astro check、Vitest、production build 與本機 Worker route smoke test。

## Cloudflare activation

以下步驟需要有效的 Cloudflare 登入，且會變更正式帳號資源：

- [x] 建立 production 與 preview 的 D1/R2、隔離 preview KV，將 resource IDs 寫入 `wrangler.jsonc`。
- [x] 產生並備份 `EMDASH_ENCRYPTION_KEY`，設定 production 與 preview secrets；production 已保留既有的 `TURNSTILE_SECRET_KEY`。
- [ ] 備份現有內容，部署 Worker，套用日期 migration，完成 EmDash/admin/binding smoke test。
- [ ] 保留舊 Worker version；正式 smoke test 通過後才切換流量。

完整指令與回復順序見 `docs/deployment.md`。

## 延後項目

- [ ] EmDash Forms 取代自訂聯絡表單。
- [ ] Sandboxed plugins、Dynamic Workers 與自訂 Portable Text blocks。
- [ ] 將剩餘 Svelte islands 改成 Astro。
- [ ] 只有量測顯示需要時，才加入 D1 read replicas、KV object cache 或額外搜尋服務。
