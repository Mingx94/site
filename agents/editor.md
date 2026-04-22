# Editor — Agent Instructions

Local-only CMS baked into the SvelteKit site. Lives under
`src/routes/(editor)/editor/` + `src/lib/editor/` + the dev-only Vite
plugin `vite-plugin-content-api.ts`. 只在 `vite dev` / `wrangler dev`
期間存在；production 由 `src/hooks.server.ts` 與
`src/routes/(editor)/+layout.server.ts` 雙重擋 404。

## Stack

- **SvelteKit 2 + Svelte 5** (runes)，同 site 共用 Vite 8 / plugin-svelte 7 / svelte-check
- **mdsvex + svelte/compiler** — 只在預覽 iframe 的 +page.svelte 做 runtime `.svx` 編譯，透過 `onMount` 內的 dynamic import 隔離在獨立 chunk，不污染 Worker bundle
- **Tailwind 4 + article.css** — 共用 site 的 `src/styles/global.css`；paper-theme chrome 透過 `src/lib/editor/paper-theme.css` layered on top
- **`/__editor/*` dev-only middleware** — `vite-plugin-content-api.ts` 掛在 site `vite.config.ts` 上（`apply: 'serve'`），固定把 `src/content/` 當 workspace
- **CodeMirror 6** — 編輯器核心，runtime 配色透過 CSS vars 與 tweaks 連動
- **bits-ui** — 共用 site 的 UI 基礎元件

## Layout

```
src/
├── routes/
│   ├── +layout.svelte          根 layout；對 /editor/* 路徑跳過 Header/Footer/skip-link
│   └── (editor)/
│       ├── +layout.server.ts   prerender=false, ssr=false, !dev→error(404)
│       ├── +layout@.svelte     只放 Google Fonts + <slot/>（layout reset）
│       └── editor/
│           ├── +page.svelte    editor 主介面（原 editor/src/App.svelte）
│           │                   import global.css + paper-theme.css
│           └── preview/+page.svelte
│                                sandboxed iframe 的內容；在 onMount 動態 import compile.ts
└── lib/editor/
    ├── components/              UI chrome
    ├── preview/
    │   ├── compile.ts           mdsvex → svelte.compile → new Function 連結器
    │   │                        （~500KB，只由 preview/+page.svelte 動態 import）
    │   ├── DynamicSvx.svelte    parent 端：post compile 到 iframe
    │   ├── iframe-host.css      iframe 專用 CSS
    │   └── registry.ts          name → site/src/content/components/*
    ├── state/                   $state 模組
    ├── io/                      /__editor/* 的 HTTP wrapper
    ├── cm/                      CodeMirror 主題 / extensions
    ├── actions/                 focusTrap 等
    ├── paper-theme.css          editor chrome 專用 CSS vars + 規則
    └── editor.d.ts              ambient：svelte/internal/* 私有模組宣告

vite-plugin-content-api.ts       dev-only middleware；詳見 agents/content-api.md
vite-plugin-content-api.test.ts  security 測試（safeResolve + isLocalRequest）
scripts/check-worker-size.ts     post-build 守門員：防止 svelte/compiler 漏進 _worker.js
```

## URL surface

| URL                            | 何時存在 | 用途                                     |
|--------------------------------|---------|------------------------------------------|
| `/editor`                      | dev     | 編輯器主介面（同 site origin）            |
| `/editor/preview`              | dev     | 被 `<iframe sandbox="allow-scripts allow-same-origin">` 載入 |
| `/__editor/tree`               | dev     | GET workspace tree                       |
| `/__editor/file?path=…`        | dev     | GET/PUT/POST/DELETE 檔案                 |
| `/__editor/dir?path=…`         | dev     | POST/DELETE 資料夾                       |
| `/__editor/rename?from=&to=`   | dev     | PATCH 改名 / 移動                        |

Production (`wrangler dev` 或 deploy)：上述全部 404。

## Preview iframe

- 因為 SvelteKit 的 dev client runtime (`/@fs/*` imports, HMR) 需要同源模組解析，
  iframe 必須 `allow-same-origin` 才能讓 onMount 運行；`allow-scripts
  allow-same-origin` 是可行的最嚴 sandbox。正文 sandbox 阻擋 forms / popups /
  top navigation，已足夠包住使用者自己寫的 .svx
- `hooks.server.ts` 對 `/editor/*` 移除所有 security headers 並送 `Cache-Control: no-store`，避免瀏覽器 pin 住舊的 XFO/CSP 造成 iframe blocked
- `DynamicSvx.svelte` iframe src 會帶 `?t=<timestamp>` query 作 cache-bust，配合 server 的 no-store 雙重保險

## Preview pipeline

`preview/compile.ts` → 注入 registry imports → `mdsvex.compile` →
`svelte.compile({ generate: 'client', runes: true })` → regex 把 ES
imports 改寫成 `__modules__['…']` 的 closure 變數 → 包進
`new Function('__modules__', …)` → 執行 → `mount()` 結果元件。

Registry 取自 `src/content/components/`（單一來源），預覽與線上文章外觀一致。

## Commands

- `npm run dev` — SvelteKit dev (`/editor` 可用)
- `npm run build` — production build
- `npm run postbuild` — 檢查 Worker bundle 大小 + 禁止 svelte/compiler 洩漏
- `npm run check` — svelte-check
- `npm run test` — vitest（含 editor state + frontmatter + image + content-api）

## Conventions

- State 在 `src/lib/editor/state/*.svelte.ts`，用 `$state` object；跨模組
  derived 包在 class 內或相鄰 helper
- Alias：site 的 `@` → `./src`；editor 內部一律用 `$lib/editor/...` 或相對路徑
- Preview pane 的 article layout 與 `/blog/[slug]/+page.svelte` 對齊
- Cover 檔名一律 `cover.jpg`（site `Cover.svelte` 的 glob 也只認 `.jpg`）
- 加新 dependency 時注意 worker-size 守門員：任何會被 SvelteKit 視為伺服器端
  共用的 module 都可能漏進 `_worker.js`，先確認是不是該放在 dynamic import 後面

## Non-features (intentional)

- 不做 git 整合。Dirty state 是 file-buffer vs disk，不是 VCS
- Preview 不做 OG image / ReactionBar / SEO meta — 那些是 server / build-time
- 編輯器不部署到生產環境 — 這是 dev-only 工具
- sidebar 不管理 `components/` / `styles/` / `assets/` — 那些用 IDE 處理
