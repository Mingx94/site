# Agent Instructions

Modular instruction files organized by topic. Load the relevant section based on your current task.

| Topic | File | When to use |
|-------|------|-------------|
| Svelte | `agents/svelte.md` | Svelte/SvelteKit 開發、MCP server 使用 |
| Coding Rules | `agents/rules.md` | 所有程式碼變更前必讀 |
| Design Context | `.impeccable.md` | UI/UX、樣式、設計決策 |
| Cloudflare | [docs](https://developers.cloudflare.com/llms-full.txt) | Workers、D1、KV、部署相關 |
| Editor | `editor/AGENTS.md` | 網頁版本地 CMS（Vite + Svelte 5 + File System Access API）— 直接讀寫 `src/content/posts/`，preview 共用 site 文章樣式與元件 |
