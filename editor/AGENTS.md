# editor — site CMS（網頁版）

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
vite-plugin-content-api.ts   dev-only middleware；見下方「Content API 模型」
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

## Content API 模型

`vite-plugin-content-api.ts` 掛在 Vite dev server 上，把 `../src/content/`
當固定 workspace 開出 `/__editor/*` 小型 JSON / binary API：

| method | route             | 用途                                         |
|--------|-------------------|----------------------------------------------|
| GET    | `/tree`           | 回 workspace 的遞迴 tree（忽略 node_modules 等） |
| GET    | `/file?path=`     | 讀檔；Content-Type 依副檔名（image/*、text/plain）|
| PUT    | `/file?path=`     | 覆寫；Windows 上遇 EBUSY/EPERM 會退避重試再 unlink+write |
| POST   | `/file?path=`     | create-only，檔案已存在回 409                |
| DELETE | `/file?path=`     | 刪檔                                         |
| POST   | `/dir?path=`      | 建資料夾                                     |
| DELETE | `/dir?path=`      | 遞迴刪資料夾                                 |
| PATCH  | `/rename?from=&to=` | 移動 / 改名                                  |

路徑語意：所有 path 都是相對 workspace 的 forward-slash 字串
（e.g. `posts/why-astro/article.svx`），不是絕對 OS 路徑。`safeResolve`
拒絕任何 `..` 越界。

middleware 只在 `vite dev` / `vite preview` 啟用；production build 沒有 server。

## Sync-from-disk

同一個 middleware 訂閱 `server.watcher`（chokidar）並把 `src/content/` 底下的
`add / change / unlink / addDir / unlinkDir` 事件以 HMR custom event
(`editor:fs`) 推給 renderer。`App.svelte` 接收後：

- `change` 事件：若該檔案已開啟且 buffer 不 dirty，重讀 disk 內容；
  若是 `posts/*/article.svx`，順便 invalidate post metadata cache 讓 sidebar 標題
  更新
- `add` / `unlink` / 目錄事件：debounce 150ms 後 refreshTree

Dirty buffer 不會被外部變更覆寫，避免吃掉未存的本地修改。

## Sidebar 模型（article-centric）

側邊欄直接列出 `posts/` 底下每一篇文章（一個 `posts/<slug>/article.svx`
= 一篇 post），不再顯示 `components/` / `styles/` / `assets/` — 那些是 site
程式碼，editor 故意不碰。

- 顯示：`postLabelFor(path)`（frontmatter `title` 優先，沒有就 fallback 到 slug）
- 右鍵選單（`ContextMenu`）：開啟 / 重新命名 slug / 刪除 / 複製 slug
- inline rename 透過 `edits.svelte.ts` 的 `startRename(slug)` 機制；F2 是全域
  shortcut（不限焦點在 sidebar）
- 新增文章：`PromptDialog` 要 slug（live 驗證 `^[a-z0-9][a-z0-9-]*$`、不可重複），
  建立 `posts/<slug>/article.svx` 的 stub 後自動開 tab

## Cover 上傳（Rail → CoverPicker）

Rail 的 Frontmatter tab 最上方有 `CoverPicker`：

- `<input type="file" accept="image/*">` → 任何資料夾選圖
- `lib/image.ts:toJpegBlob` 在瀏覽器端用 Canvas 轉 JPEG（最長邊 downscale 到
  4000px；OffscreenCanvas 不支援時 fallback 到 HTMLCanvasElement）
- `uploadFileRel('posts/<slug>/cover.jpg', blob)` 寫回 disk
- `bumpCoverBust(slug)` 讓 PreviewPane 的 `<img src=...&v=n>` 立刻換新圖，
  繞過 Vite enhanced-img 的 glob cache

Preview 端不走 site 的 `Cover.svelte`（那個依賴 `import.meta.glob` 無法即時
反映上傳），改用 plain `<img>` + cache-bust query 參數。代價是失去 LQIP 淡入
動畫，換到即時回饋。

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

## Keyboard shortcuts

| key            | action                              |
|----------------|-------------------------------------|
| `Ctrl/⌘+K`     | 開 CommandPalette                   |
| `Ctrl/⌘+S`     | 存當前 tab                          |
| `Ctrl/⌘+W`     | 關當前 tab                          |
| `` Ctrl/⌘+\ `` | 切換 Rail 顯示                       |
| `F2`           | 重新命名當前開啟 post 的 slug（全域） |
| `Esc`          | 關 CommandPalette / TweaksPanel      |

Browser 原生「離開頁面？」警告在 `dirtyCount() > 0` 時自動啟用
（`beforeunload`）。

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
