// Vault data — files, content, components palette
window.VAULT = {
  tree: [
    { type: 'dir', name: 'blog', expanded: true, children: [
      { type: 'file', name: 'astro-intro.svx', id: 'f1', git: 'M', dirty: false },
      { type: 'file', name: 'svelte-5-runes.svx', id: 'f2', git: null, dirty: true },
      { type: 'file', name: 'tailwind-v4.svx', id: 'f3', git: null, dirty: false },
      { type: 'file', name: 'og-image.md', id: 'f4', git: 'M', dirty: false },
      { type: 'file', name: 'dark-mode.svx', id: 'f5', git: '?', dirty: false },
    ]},
    { type: 'dir', name: 'drafts', expanded: false, children: [
      { type: 'file', name: 'zustand-vs-redux.svx', id: 'f6', git: '?', dirty: false },
      { type: 'file', name: 'post-ideas.md', id: 'f7', git: null, dirty: false },
    ]},
    { type: 'dir', name: 'assets', expanded: false, children: [
      { type: 'file', name: 'hero-astro.png', id: 'f8', git: null, dirty: false },
      { type: 'file', name: 'logo.svg', id: 'f9', git: null, dirty: false },
    ]},
    { type: 'file', name: 'README.md', id: 'f10', git: null, dirty: false },
  ],
  files: {
    f1: {
      name: 'astro-intro.svx',
      path: 'blog/astro-intro.svx',
      frontmatter: {
        title: '初次使用 Astro.js',
        description: '為什麼使用 Astro.js 來打造部落格',
        date: '2025-02-02',
        updated: '2025-06-25',
        draft: false,
        tags: ['astro', 'blog', 'jamstack'],
      },
      body: `2025 年已經有許多成熟的 [JAMStack](https://jamstack.org/generators/)，原本是使用 [SvelteKit](https://svelte.dev/docs/kit/introduction) 來開發網站。但是在實際開發中，SvelteKit 並不是專門為了生成靜態網頁而設計的，如果需要生成靜態網頁，則需要再手動加入一些工具，例如 [MDsveX](https://github.com/pngwn/MDsveX) 等來轉換 Markdown 文件渲染為 HTML。

## Astro

[Astro](https://astro.build/) 是個 web 框架，用於打造以內容為中心的網站，例如部落格、行銷、電商網站。Astro 以開創全新的前端架構聞名，相較其他框架使用更少 JavaScript，複雜度更低。

<Notice type="tip">
最吸引我的地方在於 Astro 可以支援各種前端框架，如 Vue、React、Svelte、Preact、SolidJS 等。
</Notice>

## 生態系

Astro 的生態系也很完整，並且他是建構在 Vite 之上，因此可以很方便的透過 Vite 插件來擴展功能。基本上就是一個開箱即用的工具。

## 效能比較

<Tabs>
  <Tab name="Astro">最少的 JavaScript，HTML-first</Tab>
  <Tab name="Next.js">React-first，SSR 強</Tab>
  <Tab name="SvelteKit">全端 Svelte，開發體驗佳</Tab>
</Tabs>

實際跑 Lighthouse 測試，Astro 的 \`performance\` 分數在靜態內容網站上常可以達到 100。`,
    },
    f2: {
      name: 'svelte-5-runes.svx',
      path: 'blog/svelte-5-runes.svx',
      frontmatter: {
        title: 'Svelte 5 Runes：從響應式糖到顯式訊號',
        description: '$state、$derived、$effect 的心智模型',
        date: '2025-03-10',
        updated: '2025-03-12',
        draft: false,
        tags: ['svelte', 'runes'],
      },
      body: `Svelte 5 引入了 Runes，讓響應式從「隱式推斷」變成「顯式標記」。

## $state

\`\`\`svelte
<script>
  let count = $state(0);
</script>
<button onclick={() => count++}>{count}</button>
\`\`\`

<Notice type="info">
Runes 只能用在 \`.svelte\` 和 \`.svelte.ts\` 檔案中。
</Notice>

## $derived

衍生值不再需要 \`$:\` — 直接宣告即可。`,
    },
    f3: {
      name: 'tailwind-v4.svx',
      path: 'blog/tailwind-v4.svx',
      frontmatter: {
        title: 'Tailwind CSS v4：CSS-first 設定',
        date: '2025-04-01',
        draft: false,
        tags: ['tailwind', 'css'],
      },
      body: `Tailwind v4 拋棄了 JS 設定檔，改用 \`@theme\` directive。

## 新語法

\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.68 0.15 30);
}
\`\`\`

<Cover src="/assets/tw-v4.png" alt="Tailwind v4" />

體驗上更貼近原生 CSS。`,
    },
  },
  components: [
    { name: 'Notice', icon: '!', desc: 'tip / info / warning 提示框',
      snippet: '<Notice type="tip">\n  提示內容\n</Notice>' },
    { name: 'Tabs', icon: '◨', desc: '分頁切換',
      snippet: '<Tabs>\n  <Tab name="A">內容 A</Tab>\n  <Tab name="B">內容 B</Tab>\n</Tabs>' },
    { name: 'Cover', icon: '▤', desc: '封面圖片',
      snippet: '<Cover src="/assets/image.png" alt="" />' },
    { name: 'Video', icon: '▷', desc: '內嵌影片',
      snippet: '<Video src="https://youtube.com/embed/..." />' },
    { name: 'Accordion', icon: '≡', desc: '可展開區塊',
      snippet: '<Accordion title="點我展開">\n  內容\n</Accordion>' },
    { name: 'Button', icon: '◎', desc: '樣式化按鈕',
      snippet: '<Button href="/">前往</Button>' },
  ],
};
