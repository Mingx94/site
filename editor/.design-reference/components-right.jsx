// ============================================================
// Editor — textarea with syntax-highlighted overlay
// ============================================================
function Editor({ value, onChange, editorFont, onSelChange }) {
  const taRef = React.useRef(null);
  const ovRef = React.useRef(null);

  const syncScroll = () => {
    if (taRef.current && ovRef.current) {
      ovRef.current.scrollTop = taRef.current.scrollTop;
      ovRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };

  React.useEffect(() => { syncScroll(); }, [value]);

  const highlighted = window.highlightSvx(value);

  const fontMap = {
    mono: '"JetBrains Mono", ui-monospace, monospace',
    serif: '"Newsreader", "Noto Serif TC", serif',
    hand: '"Kalam", "Caveat", cursive',
  };

  return (
    <div className="ed-wrap">
      <div className="ed-gutter">
        {value.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <div className="ed-scroll">
        <pre
          ref={ovRef}
          className="ed-overlay"
          style={{ fontFamily: fontMap[editorFont] }}
          dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
        />
        <textarea
          ref={taRef}
          className="ed-ta"
          style={{ fontFamily: fontMap[editorFont] }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onSelect={(e) => onSelChange && onSelChange(e.target.selectionStart, e.target.selectionEnd)}
          spellCheck={false}
          wrap="off"
        />
      </div>
    </div>
  );
}

// ============================================================
// Preview — renders markdown → paper-styled HTML
// ============================================================
function Preview({ frontmatter, body }) {
  const html = React.useMemo(() => window.renderMarkdown(body), [body]);

  // Wire up tabs after render
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current) return;
    ref.current.querySelectorAll('.rc-tabs').forEach((tw) => {
      const heads = tw.querySelectorAll('.rc-tab-head');
      const bodies = tw.querySelectorAll('.rc-tab-body');
      heads.forEach((h) => {
        h.onclick = () => {
          const i = h.dataset.i;
          heads.forEach((x) => x.classList.toggle('on', x.dataset.i === i));
          bodies.forEach((x) => x.classList.toggle('on', x.dataset.i === i));
        };
      });
    });
  }, [html]);

  const date = frontmatter.date || '';
  const updated = frontmatter.updated || '';

  return (
    <article className="preview-doc" ref={ref}>
      {frontmatter.title && <h1 className="pv-title">{frontmatter.title}</h1>}
      {frontmatter.description && <p className="pv-desc">{frontmatter.description}</p>}
      {(date || frontmatter.tags) && (
        <div className="pv-meta">
          {date && <span>📅 {date}</span>}
          {updated && <span>✎ updated {updated}</span>}
          {frontmatter.draft && <span className="pv-draft">DRAFT</span>}
          {frontmatter.tags && frontmatter.tags.map((t) => <span key={t} className="pv-tag">#{t}</span>)}
        </div>
      )}
      <div className="pv-body" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

// ============================================================
// FrontmatterForm
// ============================================================
function FrontmatterForm({ fm, onChange }) {
  const update = (k, v) => onChange({ ...fm, [k]: v });
  return (
    <div className="fm-form">
      <div className="fm-field">
        <label>title</label>
        <input value={fm.title || ''} onChange={(e) => update('title', e.target.value)} />
      </div>
      <div className="fm-field">
        <label>description</label>
        <textarea rows={2} value={fm.description || ''} onChange={(e) => update('description', e.target.value)} />
      </div>
      <div className="fm-field fm-row2">
        <div>
          <label>date</label>
          <input type="date" value={fm.date || ''} onChange={(e) => update('date', e.target.value)} />
        </div>
        <div>
          <label>updated</label>
          <input type="date" value={fm.updated || ''} onChange={(e) => update('updated', e.target.value)} />
        </div>
      </div>
      <div className="fm-field fm-toggle">
        <label>draft</label>
        <button
          className={`fm-switch ${fm.draft ? 'on' : ''}`}
          onClick={() => update('draft', !fm.draft)}
        >
          <span className="knob"></span>
          <span className="lbl">{fm.draft ? 'true' : 'false'}</span>
        </button>
      </div>
      <div className="fm-field">
        <label>tags</label>
        <div className="fm-tags">
          {(fm.tags || []).map((t, i) => (
            <span key={i} className="fm-tag">
              #{t}
              <button onClick={() => update('tags', fm.tags.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
          <input
            placeholder="+ add"
            className="fm-tag-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                update('tags', [...(fm.tags || []), e.target.value.trim()]);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Outline / TOC
// ============================================================
function Outline({ body, activeHeading, onJump }) {
  const headings = React.useMemo(() => {
    const out = [];
    const re = /^(#{1,4})\s+(.+)$/gm;
    let m;
    while ((m = re.exec(body)) !== null) {
      out.push({ level: m[1].length, text: m[2], slug: m[2].toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '') });
    }
    return out;
  }, [body]);

  if (!headings.length) return <div className="outline-empty">（沒有標題）</div>;

  return (
    <ul className="outline">
      {headings.map((h, i) => (
        <li
          key={i}
          className={`ol-${h.level} ${activeHeading === h.slug ? 'on' : ''}`}
          onClick={() => onJump(h.slug)}
        >
          <span className="ol-bullet">{'—'.repeat(Math.max(1, h.level - 1))}</span>
          {h.text}
        </li>
      ))}
    </ul>
  );
}

// ============================================================
// Palette — drag-to-insert Svelte components
// ============================================================
function Palette({ components, onInsert, onDragStart }) {
  return (
    <div className="palette">
      {components.map((c) => (
        <div
          key={c.name}
          className="comp-card"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', c.snippet);
            e.dataTransfer.effectAllowed = 'copy';
            onDragStart && onDragStart(c);
          }}
          onDoubleClick={() => onInsert(c)}
        >
          <span className="cc-ico">{c.icon}</span>
          <div className="cc-body">
            <div className="cc-name">&lt;{c.name}&gt;</div>
            <div className="cc-desc">{c.desc}</div>
          </div>
          <span className="cc-grip">⋮⋮</span>
        </div>
      ))}
      <div className="palette-hint">雙擊插入 · 或拖曳到編輯器</div>
    </div>
  );
}

Object.assign(window, { Editor, Preview, FrontmatterForm, Outline, Palette });
