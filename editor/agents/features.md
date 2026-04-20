# Editor — Features

User-facing 行為：側邊欄、Cover 上傳、鍵盤操作。

## Sidebar 模型（article-centric）

側邊欄直接列出 `posts/` 底下每一篇文章（一個 `posts/<slug>/article.svx`
= 一篇 post），不顯示 `components/` / `styles/` / `assets/` — 那些是 site
程式碼，editor 故意不碰。

- 顯示：`postLabelFor(path)`（frontmatter `title` 優先，沒有就 fallback 到 slug）
- 右鍵選單（`ContextMenu`）：開啟 / 重新命名 slug / 刪除 / 複製 slug
- inline rename 透過 `src/lib/state/edits.svelte.ts` 的 `startRename(slug)`
  機制；**F2 是全域 shortcut**（不限焦點在 sidebar）
- 新增文章：`PromptDialog` 要 slug（live 驗證 `^[a-z0-9][a-z0-9-]*$`、
  不可重複），建立 `posts/<slug>/article.svx` 的 stub 後自動開 tab

TabBar 與 CommandPalette 也都經由 `postLabelFor()` 顯示標題（不到標題時
fallback 到 slug），這樣 user 不會看到一排 `article.svx`。

## Cover 上傳（Rail → CoverPicker）

Rail 的 Frontmatter tab 最上方是 `CoverPicker`：

1. `<input type="file" accept="image/*">` — user 從任何資料夾選圖
2. `src/lib/image.ts:toJpegBlob` 在瀏覽器端用 Canvas 轉 JPEG
   - 最長邊 downscale 到 4000px
   - `OffscreenCanvas` 不支援時 fallback 到 `HTMLCanvasElement`
3. `uploadFileRel('posts/<slug>/cover.jpg', blob)` 寫回 disk
4. `bumpCoverBust(slug)` 讓 PreviewPane 的 `<img src=…&v=n>` 換新圖

Preview 端**不走** site 的 `Cover.svelte`（它依賴 `import.meta.glob`，
無法即時反映上傳），改用 plain `<img>` + cache-bust query 參數。
代價是失去 LQIP 淡入動畫，換到即時回饋。

Cover 檔名一律 `cover.jpg` —  site `Cover.svelte` 的 glob 也只認 `.jpg`，
舊的 `cover.png` / `cover.webp` 不會被讀到。

## 內文圖片（`<Figure>`）

文章內需要圖片時用 `<Figure>`（`src/content/components/Figure.svelte`）。
作法：

1. 圖檔直接放在 `posts/<slug>/` 底下，跟 `article.svx` 同層（例：
   `posts/why-astro/diagram.png`）
2. 在 `.svx` 裡寫：
   ```svelte
   <Figure src="diagram.png" alt="架構圖" caption="Figure 1：系統架構" />
   ```
3. Production 走 `enhanced-img` — 自動產生 AVIF/WebP srcset 跟 LQIP 淡入
4. Editor preview 走 dev content API（`/__editor/file?path=…`）— 圖剛丟進
   資料夾就能看見，不用 rebuild

檔名選擇：
- Cover 一定是 `cover.jpg`（site Cover.svelte 的 glob 限制）
- 內文圖任何常見副檔名都可以：`jpg|jpeg|png|webp|avif|gif`
- 不要用 `cover.*` 當內文圖檔名 — Cover 元件的 glob 會撈到

不做 markdown `![]()` 的自動轉換 — 那個走裸 `<img>` 沒 srcset。要響應式
就用 `<Figure>`，要「單純示意」就維持 markdown。

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
