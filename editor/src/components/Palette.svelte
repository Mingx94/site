<script lang="ts">
  import { insertAtCursor } from '$lib/editor-actions';

  type Item = {
    name: string;
    icon: string;
    desc: string;
    snippet: string;
  };

  const items: Item[] = [
    {
      name: 'Notice',
      icon: '!',
      desc: 'tip / info / warning 提示框',
      snippet: '<Notice type="tip">\n  提示內容\n</Notice>',
    },
    {
      name: 'Tabs',
      icon: '◨',
      desc: '分頁切換',
      snippet: '<Tabs>\n  <Tab name="A">內容 A</Tab>\n  <Tab name="B">內容 B</Tab>\n</Tabs>',
    },
    {
      name: 'Cover',
      icon: '▤',
      desc: '封面圖片（自動綁 posts/<slug>/cover.jpg）',
      snippet: '<Cover title="文章標題" />',
    },
    {
      name: 'Figure',
      icon: '🖼',
      desc: '內文圖片（posts/<slug>/ 底下檔名）',
      snippet: '<Figure src="diagram.png" alt="" caption="" />',
    },
    {
      name: 'Video',
      icon: '▷',
      desc: '內嵌影片',
      snippet: '<Video src="https://www.youtube.com/embed/..." />',
    },
    {
      name: 'Accordion',
      icon: '≡',
      desc: '可展開區塊',
      snippet: '<Accordion title="點我展開">\n  內容\n</Accordion>',
    },
    {
      name: 'Button',
      icon: '◎',
      desc: '樣式化按鈕',
      snippet: '<Button href="/">前往</Button>',
    },
  ];

  function onDragStart(e: DragEvent, snippet: string) {
    if (!e.dataTransfer) return;
    e.dataTransfer.setData('text/plain', snippet);
    e.dataTransfer.effectAllowed = 'copy';
  }
</script>

<div class="palette">
  {#each items as c (c.name)}
    <div
      class="comp-card"
      draggable="true"
      ondragstart={(e) => onDragStart(e, c.snippet)}
      ondblclick={() => insertAtCursor(c.snippet)}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && insertAtCursor(c.snippet)}
    >
      <span class="cc-ico">{c.icon}</span>
      <div class="cc-body">
        <div class="cc-name">&lt;{c.name}&gt;</div>
        <div class="cc-desc">{c.desc}</div>
      </div>
      <span class="cc-grip">⋮⋮</span>
    </div>
  {/each}
  <div class="palette-hint">雙擊插入 · 或拖曳到編輯器</div>
</div>
