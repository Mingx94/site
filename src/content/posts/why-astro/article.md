---
title: "初次使用 Astro.js"
description: "為什麼使用 Astro.js 來打造部落格"
date: 2025-02-02
updated: 2025-06-25
image: "./IMG_1896.JPG"
draft: false
---

2025 年已經有許多成熟的 [JAMStack](https://jamstack.org/generators/)，原本是使用 [SvelteKit](https://svelte.dev/docs/kit/introduction) 來開發網站。但是在實際開發中，SvelteKit 並不是專門為了生成靜態網頁而設計的，如果需要生成靜態網頁，則需要再手動加入一些工具，例如 [MDsveX](https://github.com/pngwn/MDsveX) 等來轉換 Markdown 文件渲染為 HTML。

## Astro

[Astro](https://astro.build/) 是個 web 框架，用於打造以內容為中心的網站，例如部落格、行銷、電商網站。Astro 以開創全新的前端架構聞名，相較其他框架使用更少 JavaScript，複雜度更低。

最吸引我的地方在於 Astro 可以支援各種前端框架，如 Vue、React、Svelte、Preact、SolidJS 等，並且可以很方便的透過 Markdown 文件來生成靜態網頁。

Astro 的生態系也很完整，並且他是建構在 Vite 之上，因此可以很方便的透過 Vite 插件來擴展功能。基本上就是一個開箱即用的工具。
