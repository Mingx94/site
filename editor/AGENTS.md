# editor — site CMS（網頁版）

本機 CMS，跑在 Chromium-based 瀏覽器中。lives inside the site repo
(`site/editor/`)，share `src/content/`，preview 用同一套 Tailwind typography
與文章元件渲染。

## Stack

- **Vite 6 + Svelte 5**（runes mode，無 SvelteKit）
- **mdsvex + svelte/compiler** — 在瀏覽器 runtime 把 `.svx` 即時編譯成 Svelte 元件
- **Tailwind 4 + @tailwindcss/typography** — 共用 site 文章樣式
- **File System Access API** — 取代 Electron IPC，讓瀏覽器直接讀寫 `site/src/content/posts/`
- **CodeMirror 6** — 編輯器
- **bits-ui** — site 元件（如 Tabs）所需

## Layout

```
src/
  App.svelte        shell；Welcome ↔ Workspace
  app.css           Tailwind setup + paper-theme chrome
  app.ts            renderer entry
  components/       UI chrome（Titlebar、Sidebar、FileTree、TabBar、Toolbar、
                    EditorPane、PreviewPane、Rail、StatusBar、CommandPalette、
                    TweaksPanel、Welcome、UnsavedDialog）
  preview/          即時預覽
    registry.ts     name → Svelte component map；指向 site/src/content/components/*
    compile.ts      mdsvex → svelte.compile → new Function 連結器
    DynamicSvx.svelte  debounced render host
  lib/
    io/             ← 瀏覽器檔案 IO（取代 window.electron）
      workspace-handle.ts  showDirectoryPicker + IndexedDB 持久化
      fs-access.ts         readTree / readFile / writeFile（FileSystemHandle）
      persist.ts           localStorage（tweaks/recents）+ IndexedDB（dir handle）
    state/          $state 模組（workspace / tabs / files / tweaks / ui）
    sveltekit-shim/state.svelte.ts  shim for `$app/state.page.params.slug`，
                                    讓 site Cover.svelte 在編輯器 context 也能 work
    highlight.ts    svx 語法上色
    editor-actions.ts  共用 markdown toolbar + drop insert
    frontmatter.ts  YAML-ish 解析 / 序列化
    outline.ts      heading 抽取
    util.ts         wordCount / readingTime / slugify / debounce / basename
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

## File System Access API 模型

- **Workspace** = 一個 `FileSystemDirectoryHandle`，由 user 透過
  `window.showDirectoryPicker({ mode: 'readwrite' })` 授權
- Handle 存在 IndexedDB；下次開啟時呼叫 `handle.queryPermission()` 自動恢復
  （browser 仍會要求一次點擊授權）
- 路徑語意：所有檔案 path 都是相對 workspace 的 forward-slash 字串
  （e.g. `why-astro/article.svx`），不是絕對 OS 路徑
- 支援的瀏覽器：Chrome / Edge / Brave / Arc。Firefox / Safari < 18 顯示警示

## Preview pipeline

`compile.ts` → 注入 `<script>` 從 registry 引入元件 → 跑 `mdsvex.compile`
→ 跑 `svelte.compile({ generate: 'client', runes: true })`
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

- State 在 `src/lib/state/*.svelte.ts` 用 `$state`-backed object
- Alias keys：`$lib`、`$components`、`$preview`、`$state`（內部）；
  `$content`、`@`、`$app/state`（橋接 site）
- Preview pane 把渲染後的 .svx 包在跟
  `site/src/routes/blog/[slug]/+page.svelte` 相同的 article layout，
  正文走 `.content` 共用樣式

## Non-features (intentional)

- 不做 git 整合。Dirty state 是 file-buffer vs disk，不是 VCS
- Preview 不做 OG image / ReactionBar / SEO meta — 那些是 server / build-time
- 不做檔案 watcher（拿掉 chokidar）。User 在外部編輯器改檔不會自動同步，
  需要手動點 sidebar 的「重新掃描」或重整頁面
- 不部署到生產環境 — 這是 dev-only 工具
