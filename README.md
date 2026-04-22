# Vartifact

[vartifact.cc](https://vartifact.cc) — Michael Tsai 的個人部落格，分享技術與生活。

> 本專案由 [Claude Code](https://claude.com/claude-code) 輔助開發。

## 技術棧

- **SvelteKit 2 + Svelte 5**（runes）
- **mdsvex** 寫文章（`.svx`），Shiki 語法高亮（catppuccin-mocha）
- **Tailwind 4** + 自訂 article.css
- **Cloudflare Workers** 部署（`@sveltejs/adapter-cloudflare`）
  - `BLOG_KV`：文章 view count / reactions
  - `BLOG_RATE`：per-IP rate limit
  - `SEND_EMAIL`：聯絡表單寄信
  - Turnstile：聯絡表單反爬
- **@vercel/og + sharp**：build-time 產生每篇文章的 OG 圖

## 路由

| 路徑 | 說明 |
|------|------|
| `/` | 首頁 |
| `/blog` | 文章列表 |
| `/blog/[slug]` | 文章內頁（含 reactions、reading time） |
| `/blog/[slug].md` | 原始 markdown（供 agent / reader 讀取） |
| `/about` | 關於 |
| `/contact` | 聯絡表單（Turnstile 保護） |
| `/rss.xml`、`/sitemap.xml` | 訂閱與 SEO |
| `/llms.txt` | LLM 爬蟲用的 markdown 索引（[llmstxt.org](https://llmstxt.org)） |
| `/.well-known/api-catalog`、`/.well-known/agent-skills` | agent discovery |
| `/editor` | **只在 dev 環境可用**的本地 CMS |

## 本地開發

```bash
npm install
npm run dev       # vite dev，預設 http://localhost:4321
```

常用指令：

| 指令 | 用途 |
|------|------|
| `npm run dev` | 開發伺服器 |
| `npm run build` | production build |
| `npm run check` | svelte-check（型別 + a11y） |
| `npm run test` | vitest |
| `npm run gen-og` | 重跑 OG 圖產生 |
| `npm run cf-typegen` | 從 `wrangler.jsonc` 產生 Cloudflare 綁定型別 |

## 對 agent 友善

- 每篇文章都有 markdown 版本：`/blog/<slug>.md`
- 文章 HTML 同時宣告 `<link rel="alternate" type="text/markdown">` 與 HTTP `Link` header（RFC 8288）
- 對 `/blog/<slug>` 送 `Accept: text/markdown` 會直接回 markdown（[hooks.server.ts](src/hooks.server.ts) 做 content negotiation，帶 `Vary: Accept`）
- `/llms.txt` 提供全站 markdown 索引
- `/.well-known/api-catalog`（RFC 9727）、`/.well-known/agent-skills`（Cloudflare discovery RFC）

## 內建編輯器

`/editor` 是 dev-only 的本地 CMS，直接讀寫 `src/content/` 下的檔案。Production build 會 404 擋掉所有 `/editor/*` 與 `/__editor/*`，編輯器程式碼也不會進 Worker bundle。細節見 [agents/editor.md](agents/editor.md)。

## 專案結構

```
src/
├── routes/              SvelteKit 路由
│   ├── (editor)/        dev-only 編輯器
│   └── blog/[slug]/     文章頁
├── lib/
│   ├── blog.remote.ts   view count / reactions 的 remote functions
│   ├── editor/          編輯器實作
│   └── server/          server-only helper
├── content/
│   ├── posts/<slug>/    文章內容（article.svx + cover.jpg）
│   ├── components/      .svx 可用的自訂元件（Cover、Figure、Tabs…）
│   └── styles/          article 專用 CSS
├── components/          site UI 元件
├── styles/global.css    全站樣式
└── hooks.server.ts      security headers / editor 路徑例外

scripts/
├── gen-og.ts            prebuild：產生 static/og/*.png
└── check-worker-size.ts postbuild：防 svelte/compiler 漏進 worker

vite-plugin-content-api.ts  dev-only 檔案系統 API（/__editor/*）
```

## 寫新文章

1. 在 `src/content/posts/<slug>/` 放 `article.svx` 和 `cover.jpg`
2. `article.svx` frontmatter 要有 `title` / `date` / `description`
3. `npm run dev` 打開 `/editor` 或直接用 IDE 編輯
4. build 時 OG 圖會自動產生到 `static/og/<slug>.png`

## License

[MIT](LICENSE) © Michael Tsai
