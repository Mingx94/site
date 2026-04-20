// Paper-themed markdown → HTML renderer (very small, just what we need)
window.renderMarkdown = function(src) {
  if (!src) return '';
  // Escape only in plain text (rough but fine for demo)
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = src.split('\n');
  let out = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf = [];
  let inComp = null;   // currently collecting <Notice>/<Tabs>/...
  let compBuf = [];
  let compType = '';
  let compAttrs = '';
  let para = [];

  const flushPara = () => {
    if (!para.length) return;
    const txt = para.join(' ');
    out.push(`<p>${inline(txt)}</p>`);
    para = [];
  };

  const inline = (t) => {
    let s = esc(t);
    // inline code
    s = s.replace(/`([^`]+)`/g, '<code class="ic">$1</code>');
    // links
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="lnk" href="$2">$1</a>');
    // bold / italic
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
    return s;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code
    if (line.startsWith('```')) {
      if (!inCode) {
        flushPara();
        inCode = true;
        codeLang = line.slice(3).trim();
        codeBuf = [];
      } else {
        out.push(`<pre class="code-block"><div class="code-lang">${esc(codeLang || 'text')}</div><code>${esc(codeBuf.join('\n'))}</code></pre>`);
        inCode = false; codeLang = ''; codeBuf = [];
      }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }

    // Svelte component blocks (inline rendering as a styled card)
    const openMatch = line.match(/^<(Notice|Tabs|Cover|Video|Accordion|Button)(\s[^>]*)?(\/)?>(.*)?$/);
    const closeMatch = line.match(/^<\/(Notice|Tabs|Cover|Video|Accordion|Button)>$/);

    if (inComp) {
      if (closeMatch && closeMatch[1] === inComp) {
        out.push(renderComponent(inComp, compAttrs, compBuf.join('\n')));
        inComp = null; compBuf = []; compAttrs = ''; compType = '';
      } else {
        compBuf.push(line);
      }
      continue;
    }

    if (openMatch) {
      flushPara();
      const tag = openMatch[1];
      const attrs = openMatch[2] || '';
      const selfClose = openMatch[3] === '/';
      if (selfClose) {
        out.push(renderComponent(tag, attrs, ''));
      } else {
        // check if closing on same line
        const sameLineClose = line.match(new RegExp(`</${tag}>\\s*$`));
        if (sameLineClose) {
          const inner = line.replace(openMatch[0].slice(0, openMatch[0].length - (openMatch[4] || '').length), '').replace(`</${tag}>`, '').trim();
          // simpler: extract between > and </Tag>
          const m = line.match(new RegExp(`^<${tag}[^>]*>(.*)</${tag}>$`));
          out.push(renderComponent(tag, attrs, m ? m[1] : ''));
        } else {
          inComp = tag; compAttrs = attrs; compBuf = []; compType = tag;
        }
      }
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushPara();
      const lv = h[1].length;
      const slug = h[2].toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
      out.push(`<h${lv} id="${slug}" class="h-${lv}">${inline(h[2])}</h${lv}>`);
      continue;
    }

    if (line.trim() === '') { flushPara(); continue; }

    para.push(line);
  }
  flushPara();
  return out.join('\n');
};

function renderComponent(tag, attrs, inner) {
  const a = parseAttrs(attrs || '');
  if (tag === 'Notice') {
    const type = a.type || 'info';
    const icons = { tip: '✓', info: 'i', warning: '!', danger: '×' };
    const ico = icons[type] || 'i';
    return `<div class="rc-notice rc-${type}">
      <div class="rc-notice-head"><span class="rc-ico">${ico}</span><span class="rc-type">${type}</span></div>
      <div class="rc-notice-body">${window.renderMarkdown(inner)}</div>
    </div>`;
  }
  if (tag === 'Tabs') {
    // Parse inner <Tab name="X">...</Tab>
    const tabs = [];
    const re = /<Tab\s+name="([^"]+)"\s*>([\s\S]*?)<\/Tab>/g;
    let m;
    while ((m = re.exec(inner)) !== null) {
      tabs.push({ name: m[1], body: m[2].trim() });
    }
    const heads = tabs.map((t, i) => `<button class="rc-tab-head ${i === 0 ? 'on' : ''}" data-i="${i}">${t.name}</button>`).join('');
    const bodies = tabs.map((t, i) => `<div class="rc-tab-body ${i === 0 ? 'on' : ''}" data-i="${i}">${window.renderMarkdown(t.body)}</div>`).join('');
    return `<div class="rc-tabs"><div class="rc-tab-heads">${heads}</div><div class="rc-tab-bodies">${bodies}</div></div>`;
  }
  if (tag === 'Cover') {
    return `<figure class="rc-cover"><div class="rc-cover-ph"><span class="rc-mono">${a.src || 'image'}</span><span class="rc-mono sm">cover placeholder</span></div>${a.alt ? `<figcaption>${a.alt}</figcaption>` : ''}</figure>`;
  }
  if (tag === 'Video') {
    return `<div class="rc-video"><div class="rc-cover-ph"><span class="rc-mono">▷ ${a.src || 'video'}</span></div></div>`;
  }
  if (tag === 'Accordion') {
    return `<details class="rc-acc"><summary>${a.title || '展開'}</summary><div>${window.renderMarkdown(inner)}</div></details>`;
  }
  if (tag === 'Button') {
    return `<a class="rc-btn" href="${a.href || '#'}">${inner || 'Button'}</a>`;
  }
  return `<div class="rc-unknown">&lt;${tag}&gt;</div>`;
}

function parseAttrs(s) {
  const out = {};
  const re = /(\w+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(s)) !== null) out[m[1]] = m[2];
  return out;
}
