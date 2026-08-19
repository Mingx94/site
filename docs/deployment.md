# Cloudflare 部署

本專案使用 Cloudflare Workers。`wrangler.jsonc` 內的資源 ID 與電子郵件設定屬於目前的 Cloudflare 帳號。改用其他帳號時，必須更換這些值。

## 前置需求

- Node.js 22 或更新版本
- 專案依賴已透過 `npm ci` 安裝
- Wrangler 已登入正確的 Cloudflare 帳號：`npx wrangler login`

## Cloudflare 資源

| 設定 | 用途 | 注意事項 |
| --- | --- | --- |
| `BLOG_KV` | 瀏覽次數、reaction 與聯絡表單資料 | 新帳號必須建立 KV namespace，並更換 `id`。 |
| `BLOG_RATE` | 限制每個 IP 的寫入頻率 | `namespace_id` 必須在帳號內保持唯一。 |
| `SEND_EMAIL` | 傳送聯絡表單通知 | 先啟用 Email Routing，並驗證目的信箱。 |
| `TURNSTILE_SITE_KEY` | 在瀏覽器載入 Turnstile | 建立新 widget 後，更換 `wrangler.jsonc` 內的公開金鑰。 |
| `TURNSTILE_SECRET_KEY` | 在伺服器驗證 Turnstile | 只以 Wrangler secret 儲存，不可提交到 Git。 |

設定正式環境的 Turnstile secret：

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```

若要更換收件地址，請同時更新 `wrangler.jsonc` 與 `src/routes/contact/contact.remote.ts`。兩處的地址必須一致。

自訂網域未記錄在 `wrangler.jsonc`。需要時，請在 Cloudflare Dashboard 將網域連接至部署後的 Worker。

## 本機測試

一般畫面與內容開發使用：

```bash
npm run dev
```

此模式沒有 Cloudflare bindings。瀏覽次數和 reaction 不會寫入，聯絡表單也不能完整運作。

要測試 Cloudflare Worker 與 bindings，先建立輸出，再啟動 Wrangler：

```bash
npm run build
npx wrangler dev
```

將本機 secret 放在未追蹤的 `.dev.vars`：

```dotenv
TURNSTILE_SECRET_KEY=your-secret
```

`BLOG_KV` 設有 `remote: true`。Wrangler 開發模式會連接設定的遠端 KV。測試寫入可能影響正式資料。

## 部署

```bash
npm ci
npm run check
npm test
npm run build
npx wrangler deploy
```

本專案沒有 `npm run deploy` 指令。`npm run build` 會先產生 OG 圖，再建立 `.svelte-kit/cloudflare` Worker 輸出。

部署後請檢查：

1. 首頁與文章頁可正常開啟。
2. `/rss.xml`、`/sitemap.xml` 與 `/llms.txt` 可正常讀取。
3. 瀏覽次數與 reaction 可以更新。
4. Turnstile 可驗證聯絡表單。
5. 聯絡表單通知可送到已驗證的信箱。
