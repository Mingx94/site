# Editor — Architecture

本機 CMS，跑在 Chromium-based 瀏覽器中。lives inside the site repo
(`site/editor/`)，share `src/content/`，preview 用同一套 Tailwind typography
與文章元件渲染。

## Stack

- **Vite 6 + Svelte 5**（runes mode，無 SvelteKit）
- **mdsvex + svelte/compiler** — 在瀏覽器 runtime 把 `.svx` 即時編譯成 Svelte 元件
- **Tailwind 4 + @tailwindcss/typography** — 共用 site 文章樣式
- **dev-only Vite middleware**（`vite-plugin-content-api.ts`）— 固定把
  `../src/content/` 當 workspace，透過 `/__editor/*` HTTP endpoints 讀寫檔案。
  不用 File System Access API，沒有目錄選擇對話框、沒有 permission grant
- **CodeMirror 6** — 編輯器
- **bits-ui** — site 元件（如 Tabs）所需

## Layout

```
src/
  App.svelte        shell；掛全域鍵盤快捷鍵、接收 HMR `editor:fs` 事件
  app.css           Tailwind setup + paper-theme chrome
  app.ts            renderer entry
  components/       UI chrome：
                    Titlebar、Sidebar、PostList、TabBar、Toolbar、
                    EditorPane、PreviewPane、Rail、CoverPicker、
                    FrontmatterForm、Outline、Palette、StatusBar、
                    CommandPalette、TweaksPanel、ContextMenu、
                    ConfirmDialog、PromptDialog
  preview/          即時預覽
    registry.ts     name → Svelte component map；指向 site/src/content/components/*
    compile.ts      mdsvex → svelte.compile → new Function 連結器
    DynamicSvx.svelte  debounced render host
  lib/
    io/             ← 瀏覽器端 HTTP wrapper（呼叫 /__editor/*）
      fs-access.ts    readTree / readFile / writeFile / createFile /
                      deleteFile / createDir / deleteDir / renamePath /
                      uploadFileRel / assetUrlFor
      persist.ts      localStorage（tweaks / recents）
    state/          $state 模組（workspace / tabs / files / tweaks / ui /
                    posts / edits）
    sveltekit-shim/state.svelte.ts  shim for `$app/state.page.params.slug`，
                                    讓 site Cover.svelte 在編輯器 context 也能 work
    highlight.ts    svx 語法上色
    editor-actions.ts  共用 markdown toolbar + drop insert
    frontmatter.ts  YAML-ish 解析 / 序列化
    outline.ts      heading 抽取
    image.ts        Canvas → JPEG（OffscreenCanvas + HTMLCanvasElement fallback，
                    最長邊 downscale 到 4000px）
    util.ts         wordCount / readingTime / slugify / debounce / basename
vite-plugin-content-api.ts   dev-only middleware；見 `agents/content-api.md`
.design-reference/  原始 Claude Design HTML/CSS/JS（僅參考）
```

## Site integration

Vite aliases（見 `vite.config.ts`）：

| alias        | resolves to                  |
|--------------|------------------------------|
| `@`          | `../src`（site src）         |
| `$content`   | `../src/content`             |
| `$app/state` | shim（page.params.slug）     |

site 文章樣式 `.content` 來自 `../src/content/styles/article.css`，
透過 `editor/src/app.css` import 共用。

## Preview pipeline

`preview/compile.ts` → 注入 `<script>` 從 registry 引入元件 → 跑
`mdsvex.compile` → 跑 `svelte.compile({ generate: 'client', runes: true })`
→ 用 regex 把 ES imports 改寫成 `__modules__['…']` 的 closure 變數
→ 包進 `new Function('__modules__', …)` → 執行 → `mount()` 結果元件。

Registry 來自 `site/src/content/components/`（單一來源），所以預覽和線上文章
外觀完全一致。

## Commands

- `npm run dev` — Vite 啟動 localhost:5173
- `npm run build` — 靜態 SPA 打包到 `dist/`
- `npm run preview` — 預覽 production build
- `npm run check` — svelte-check 型別檢查

## Conventions

- State 在 `src/lib/state/*.svelte.ts` 用 `$state`-backed object，需要跨模組
  reactive 的 derived 包在 class 裡（否則 module-level `$derived` 出去後不
  re-evaluate）
- Alias keys：`$lib`、`$components`、`$preview`、`$state`（內部）；
  `$content`、`@`、`$app/state`（橋接 site）
- Preview pane 把渲染後的 .svx 包在跟
  `site/src/routes/blog/[slug]/+page.svelte` 相同的 article layout，
  正文走 `.content` 共用樣式
- Cover 檔名一律 `cover.jpg`（編輯器只寫這個路徑；site `Cover.svelte` 的 glob
  也只認 `.jpg`）

## Non-features (intentional)

- 不做 git 整合。Dirty state 是 file-buffer vs disk，不是 VCS
- Preview 不做 OG image / ReactionBar / SEO meta — 那些是 server / build-time
- 不部署到生產環境 — 這是 dev-only 工具
- sidebar 不管理 `components/` / `styles/` / `assets/` — 那些用 IDE 處理
