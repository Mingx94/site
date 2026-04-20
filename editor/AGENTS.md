# editor — Agent Instructions

網頁版本地 CMS（Vite + Svelte 5）。固定把 `site/src/content/` 當 workspace，
preview 共用 site 的文章樣式與元件。

Modular instruction files organized by topic. Load the relevant section
based on your current task.

| Topic        | File                       | When to use |
|--------------|----------------------------|-------------|
| Architecture | `agents/architecture.md`   | Stack、檔案結構、Vite alias、preview pipeline、commands、conventions |
| Content API  | `agents/content-api.md`    | 讀寫檔案 IO、`/__editor/*` middleware、Windows file-lock 處理、`editor:fs` 同步事件 |
| Features     | `agents/features.md`       | Sidebar / PostList、Cover 上傳流程、鍵盤 shortcuts |
