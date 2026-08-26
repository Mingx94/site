# 移除 Svelte

## 技術決定

- 公開網站改用 Astro 元件輸出 HTML 與 CSS。
- 互動沿用 Astro 頁面中的原生 `<script>`。
- 現在不加入 Web Components 或另一套前端框架。只有可重用互動需要獨立生命週期時，才評估 Web Components。
- EmDash 管理介面仍需要 React；本次不移除 React。

## 1. 共用元件

- [x] 將 Header、Footer、Container、Logo、Link、FontToggle 與 ThemeSettings 改成 Astro 元件。
- [x] 將 BackToTop、BackToPrev、PostCover、FormattedDate、ArticleClient 與 ReactionBar 改成 Astro 元件。
- [x] 用 `Intl.DateTimeFormat` 取代 `date-fns`。

## 2. 頁面

- [x] 將首頁、文章列表、About 與 404 的 Svelte 頁面模板改成 Astro。
- [x] 更新文章頁與 Base layout 的元件 imports。
- [x] 保留現有主題、字體、搜尋、閱讀進度、目錄、瀏覽次數與 reactions 行為。

## 3. 清理

- [x] 刪除未使用的 ArrowCard、Social、tabs、popover 與 Svelte button 元件。
- [x] 刪除其餘 `.svelte` 檔案與不再使用的 `src/routes` 目錄。
- [x] 從 Astro 設定移除 Svelte integration，並將 icons compiler 改成 Astro。
- [x] 移除 `@astrojs/svelte`、Svelte、Svelte Check、Svelte Prettier plugin、Bits UI、`date-fns` 與 `clsx`。

## 4. 驗證

- [x] 確認程式碼、設定與 lockfile 不再包含網站使用的 Svelte runtime 或 `.svelte` imports。
- [x] 通過 `npm run check`、`npm test` 與 `npm run build`。
- [x] 在桌面與手機尺寸檢查首頁、文章列表、文章頁、About、Contact 與 404；確認鍵盤操作與可存取名稱正常。
- [x] 確認公開頁面不載入 Svelte runtime，並比較主要頁面的版面與效能。
- [x] 經使用者同意後部署，再完成正式站 smoke test。
