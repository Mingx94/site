// ============================================================
// Main App — SVX Editor (three-column paper layout)
// ============================================================
const { useState, useEffect, useMemo, useCallback, useRef } = React;

function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: src };
  const fm = {};
  m[1].split('\n').forEach((line) => {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) return;
    let v = mm[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if (v === 'true') v = true;
    else if (v === 'false') v = false;
    else v = v.replace(/^["']|["']$/g, '');
    fm[mm[1]] = v;
  });
  return { fm, body: m[2] };
}

function App() {
  const [tree, setTree] = useState(window.VAULT.tree);
  const [files, setFiles] = useState(window.VAULT.files);
  const [openFiles, setOpenFiles] = useState(['f1', 'f2']);
  const [activeId, setActiveId] = useState('f1');
  const [previewMode, setPreviewMode] = useState('split');
  const [railOpen, setRailOpen] = useState(true);
  const [railTab, setRailTab] = useState('fm');
  const [search, setSearch] = useState('');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [tweaksOn, setTweaksOn] = useState(false);
  const [tweaks, setTweaks] = useState(window.TWEAKS);
  const [activeHeading, setActiveHeading] = useState('');
  const editorRef = useRef(null);

  const activeFile = files[activeId];

  // Body + frontmatter handling
  const setBody = (body) => {
    setFiles((f) => ({ ...f, [activeId]: { ...f[activeId], body } }));
    markDirty(activeId);
  };
  const setFrontmatter = (fm) => {
    setFiles((f) => ({ ...f, [activeId]: { ...f[activeId], frontmatter: fm } }));
    markDirty(activeId);
  };
  const markDirty = (id) => {
    setTree((t) => markNode(t, id, { dirty: true }));
  };

  // Open / close / tabs
  const openFile = (id) => {
    if (!openFiles.includes(id)) setOpenFiles((o) => [...o, id]);
    setActiveId(id);
  };
  const closeFile = (id) => {
    const idx = openFiles.indexOf(id);
    const next = openFiles.filter((x) => x !== id);
    setOpenFiles(next);
    if (activeId === id && next.length) {
      setActiveId(next[Math.max(0, idx - 1)]);
    }
  };
  const toggleDir = (dir) => {
    setTree((t) => toggleDirIn(t, dir));
  };

  // Toolbar actions
  const applyToolbar = (act) => {
    const ta = editorRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const val = ta.value;
    const sel = val.slice(start, end) || '文字';
    let ins = sel;
    let caretOffset = 0;
    const wrap = (pre, post = pre) => { ins = pre + sel + post; };
    const line = (pre) => { ins = pre + sel; };
    switch (act) {
      case 'bold': wrap('**'); break;
      case 'italic': wrap('*'); break;
      case 'strike': wrap('~~'); break;
      case 'code': wrap('`'); break;
      case 'h1': line('# '); break;
      case 'h2': line('## '); break;
      case 'h3': line('### '); break;
      case 'link': ins = `[${sel}](https://)`; caretOffset = -1; break;
      case 'quote': line('> '); break;
      case 'ul': line('- '); break;
      case 'ol': line('1. '); break;
      case 'task': line('- [ ] '); break;
      case 'hr': ins = '\n---\n'; break;
    }
    const nv = val.slice(0, start) + ins + val.slice(end);
    setBody(fullDoc(activeFile.frontmatter, nv.replace(fullDoc(activeFile.frontmatter, '') + '', '') || nv));
    // simpler: replace whole body via state using ta offset shift
    setTimeout(() => {
      ta.focus();
      const p = start + ins.length + caretOffset;
      ta.setSelectionRange(p, p);
    }, 0);
  };

  // Convert between frontmatter+body <-> full doc for editor ta
  const fullDoc = (fm, body) => {
    if (!fm || !Object.keys(fm).length) return body;
    return window.serializeFrontmatter(fm) + '\n\n' + body;
  };
  const editorValue = useMemo(() => {
    if (!activeFile) return '';
    return fullDoc(activeFile.frontmatter, activeFile.body);
  }, [activeFile]);

  const onEditorChange = (v) => {
    const { fm, body } = parseFrontmatter(v);
    setFiles((f) => ({ ...f, [activeId]: { ...f[activeId], frontmatter: fm, body } }));
    markDirty(activeId);
  };

  const insertComponent = (comp) => {
    const ta = editorRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const before = value.slice(0, s);
    const after = value.slice(e);
    const insert = (before.endsWith('\n') || s === 0 ? '' : '\n') + comp.snippet + (after.startsWith('\n') ? '' : '\n');
    const nv = before + insert + after;
    onEditorChange(nv);
    setTimeout(() => {
      ta.focus();
      const p = s + insert.length;
      ta.setSelectionRange(p, p);
    }, 0);
  };

  // Drop handler on editor
  const onDrop = (e) => {
    e.preventDefault();
    const snippet = e.dataTransfer.getData('text/plain');
    if (!snippet) return;
    const ta = editorRef.current;
    const s = ta.selectionStart;
    const before = ta.value.slice(0, s);
    const after = ta.value.slice(s);
    const nv = before + '\n' + snippet + '\n' + after;
    onEditorChange(nv);
  };

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); setCmdOpen((x) => !x);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault(); applyToolbar('bold');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault(); applyToolbar('italic');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault(); saveActive();
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [activeId, activeFile]);

  const saveActive = () => {
    setTree((t) => markNode(t, activeId, { dirty: false, git: 'M' }));
  };

  // Tweaks protocol
  useEffect(() => {
    const h = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setTweaksOn(true);
      if (d.type === '__deactivate_edit_mode') setTweaksOn(false);
    };
    window.addEventListener('message', h);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', h);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--paper', tweaks.paperTone === 'warm' ? '#f3ede0' : tweaks.paperTone === 'cool' ? '#e9ece9' : '#ececea');
    root.style.setProperty('--paper-2', tweaks.paperTone === 'warm' ? '#ebe3d1' : tweaks.paperTone === 'cool' ? '#dde2dd' : '#e0e0dd');
    root.style.setProperty('--paper-card', tweaks.paperTone === 'warm' ? '#fffdf6' : '#ffffff');
    root.style.setProperty('--accent', tweaks.accent === 'red' ? '#b2462d' : tweaks.accent === 'blue' ? '#2d5d9e' : tweaks.accent === 'green' ? '#3a6b52' : '#6b4a9c');
    document.body.classList.toggle('dense', tweaks.density === 'dense');
  }, [tweaks]);

  const updateTweak = (k, v) => {
    const n = { ...tweaks, [k]: v };
    setTweaks(n);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };

  // Search filter
  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;
    const q = search.toLowerCase();
    const hit = (n) => {
      if (n.type === 'dir') {
        const kids = n.children.map(hit).filter(Boolean);
        return kids.length ? { ...n, expanded: true, children: kids } : null;
      }
      const f = files[n.id];
      const inBody = f && (f.body.toLowerCase().includes(q) || f.frontmatter.title?.toLowerCase().includes(q));
      return n.name.toLowerCase().includes(q) || inBody ? n : null;
    };
    return tree.map(hit).filter(Boolean);
  }, [tree, search, files]);

  const wc = window.wordCount(activeFile?.body || '');
  const readMin = Math.max(1, Math.ceil(wc / 280));
  const dirtyCount = countDirty(tree);

  return (
    <div className="app">
      {/* titlebar */}
      <div className="titlebar">
        <div className="tl-dots">
          <span className="tl-dot r"></span>
          <span className="tl-dot y"></span>
          <span className="tl-dot g"></span>
        </div>
        <div className="tl-title">
          <span className="tl-vault">site</span>
          <span className="tl-sep">/</span>
          <span className="tl-path">{activeFile?.path || ''}</span>
          {dirtyCount > 0 && <span className="tl-modified">● {dirtyCount} modified</span>}
        </div>
        <div className="tl-right">
          <button className="tl-icon" onClick={() => setCmdOpen(true)} title="⌘K">⌘K</button>
          <button className="tl-icon" onClick={() => setRailOpen((x) => !x)} title="切換右欄">⊟</button>
        </div>
      </div>

      <div className={`body ${railOpen ? '' : 'rail-hidden'} ${previewMode}`}>
        {/* sidebar */}
        <aside className="sidebar">
          <div className="sb-search">
            <span className="sb-search-ico">⌕</span>
            <input
              placeholder="搜尋檔案或內文…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')}>×</button>}
          </div>
          <div className="sb-section">
            <span>VAULT</span>
            <button className="sb-mini" title="新檔案">＋</button>
          </div>
          <div className="sb-tree">
            <FileTree
              tree={filteredTree}
              openFiles={openFiles}
              activeId={activeId}
              onOpen={openFile}
              onToggleDir={toggleDir}
            />
          </div>
          <div className="sb-section">
            <span>GIT</span>
          </div>
          <div className="sb-git">
            <div className="gt-row">
              <span className="gt-branch">⎇ main</span>
              <span className="gt-ahead">↑ 2</span>
            </div>
            {gitChanges(tree, files).map((g) => (
              <div key={g.id} className="gt-file" onClick={() => openFile(g.id)}>
                <span className={`gt-stat g-${g.status.toLowerCase()}`}>{g.status}</span>
                <span>{g.name}</span>
              </div>
            ))}
            <button className="gt-commit">Commit · 3 changes</button>
          </div>
        </aside>

        {/* main */}
        <main className="main">
          <TabBar
            openFiles={openFiles}
            activeId={activeId}
            files={files}
            onActivate={setActiveId}
            onClose={closeFile}
          />
          <Toolbar
            onAction={applyToolbar}
            previewMode={previewMode}
            onTogglePreview={setPreviewMode}
            onToggleRail={() => setRailOpen((x) => !x)}
            railOpen={railOpen}
          />
          <div className="panes">
            {(previewMode === 'split' || previewMode === 'edit') && (
              <div
                className="pane pane-editor"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                onDrop={(e) => { e.currentTarget.classList.remove('drag-over'); onDrop(e); }}
              >
                <EditorHost
                  ref={editorRef}
                  value={editorValue}
                  onChange={onEditorChange}
                  editorFont={tweaks.editorFont}
                />
              </div>
            )}
            {(previewMode === 'split' || previewMode === 'preview') && activeFile && (
              <div className="pane pane-preview">
                <Preview frontmatter={activeFile.frontmatter} body={activeFile.body} />
              </div>
            )}
          </div>
          <StatusBar
            wc={wc}
            readMin={readMin}
            dirtyCount={dirtyCount}
            previewMode={previewMode}
          />
        </main>

        {/* right rail */}
        {railOpen && activeFile && (
          <aside className="rail">
            <div className="rail-tabs">
              <button className={railTab === 'fm' ? 'on' : ''} onClick={() => setRailTab('fm')}>Frontmatter</button>
              <button className={railTab === 'toc' ? 'on' : ''} onClick={() => setRailTab('toc')}>Outline</button>
              <button className={railTab === 'comp' ? 'on' : ''} onClick={() => setRailTab('comp')}>Components</button>
            </div>
            <div className="rail-body">
              {railTab === 'fm' && (
                <FrontmatterForm fm={activeFile.frontmatter} onChange={setFrontmatter} />
              )}
              {railTab === 'toc' && (
                <Outline body={activeFile.body} activeHeading={activeHeading} onJump={setActiveHeading} />
              )}
              {railTab === 'comp' && (
                <Palette components={window.VAULT.components} onInsert={insertComponent} />
              )}
            </div>
          </aside>
        )}
      </div>

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} files={files} onOpen={(id) => { openFile(id); setCmdOpen(false); }} />}

      {tweaksOn && <TweaksPanel tweaks={tweaks} onChange={updateTweak} />}
    </div>
  );
}

// EditorHost forwards ref to textarea
const EditorHost = React.forwardRef(({ value, onChange, editorFont }, ref) => {
  const innerRef = useRef(null);
  React.useImperativeHandle(ref, () => innerRef.current);

  const fontMap = {
    mono: '"JetBrains Mono", ui-monospace, monospace',
    serif: '"Newsreader", "Noto Serif TC", serif',
    hand: '"Kalam", "Caveat", cursive',
  };

  const highlighted = window.highlightSvx(value);

  const syncScroll = () => {
    const ta = innerRef.current;
    const ov = ta?.parentElement?.querySelector('.ed-overlay');
    const g = ta?.parentElement?.parentElement?.querySelector('.ed-gutter');
    if (ov) { ov.scrollTop = ta.scrollTop; ov.scrollLeft = ta.scrollLeft; }
    if (g) { g.scrollTop = ta.scrollTop; }
  };

  return (
    <div className="ed-wrap">
      <div className="ed-gutter">
        {value.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <div className="ed-scroll">
        <pre
          className="ed-overlay"
          style={{ fontFamily: fontMap[editorFont] }}
          dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
        />
        <textarea
          ref={innerRef}
          className="ed-ta"
          style={{ fontFamily: fontMap[editorFont] }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          wrap="off"
        />
      </div>
    </div>
  );
});

function StatusBar({ wc, readMin, dirtyCount, previewMode }) {
  return (
    <div className="statusbar">
      <span className="sb-branch">⎇ main</span>
      <span>{dirtyCount > 0 ? <span className="sb-dirty">● {dirtyCount} unsaved</span> : <span className="sb-saved">✓ saved</span>}</span>
      <span className="sb-sep"></span>
      <span>mdsvex</span>
      <span>UTF-8</span>
      <span className="sb-spacer"></span>
      <span>{wc.toLocaleString()} 字 · {readMin} min read</span>
      <span>預覽：{previewMode}</span>
    </div>
  );
}

function CommandPalette({ onClose, files, onOpen }) {
  const [q, setQ] = useState('');
  const list = Object.entries(files)
    .filter(([id, f]) => !q || f.name.toLowerCase().includes(q.toLowerCase()) || f.frontmatter.title?.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 8);
  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-box" onClick={(e) => e.stopPropagation()}>
        <input autoFocus placeholder="輸入指令或檔名…  ⌘K" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="cmd-list">
          {list.map(([id, f]) => (
            <div key={id} className="cmd-item" onClick={() => onOpen(id)}>
              <span className="cmd-ico">✎</span>
              <span className="cmd-name">{f.name}</span>
              <span className="cmd-title">{f.frontmatter.title}</span>
            </div>
          ))}
          {list.length === 0 && <div className="cmd-empty">沒有符合的檔案</div>}
        </div>
        <div className="cmd-hint">
          <span>↑↓ 選擇</span><span>↵ 開啟</span><span>esc 關閉</span>
        </div>
      </div>
    </div>
  );
}

function TweaksPanel({ tweaks, onChange }) {
  const Seg = ({ k, opts }) => (
    <div className="tk-seg">
      {opts.map((o) => (
        <button key={o.v} className={tweaks[k] === o.v ? 'on' : ''} onClick={() => onChange(k, o.v)}>{o.l}</button>
      ))}
    </div>
  );
  return (
    <div className="tweaks-panel">
      <div className="tk-head">
        <span className="tk-title">Tweaks</span>
        <span className="tk-sub">設計調整</span>
      </div>
      <div className="tk-row">
        <label>紙張色調</label>
        <Seg k="paperTone" opts={[{v:'warm',l:'暖'},{v:'cool',l:'冷'},{v:'neutral',l:'中'}]} />
      </div>
      <div className="tk-row">
        <label>重點色</label>
        <Seg k="accent" opts={[{v:'red',l:'朱'},{v:'blue',l:'藍'},{v:'green',l:'綠'},{v:'purple',l:'紫'}]} />
      </div>
      <div className="tk-row">
        <label>編輯器字體</label>
        <Seg k="editorFont" opts={[{v:'mono',l:'等寬'},{v:'serif',l:'襯線'},{v:'hand',l:'手寫'}]} />
      </div>
      <div className="tk-row">
        <label>密度</label>
        <Seg k="density" opts={[{v:'cozy',l:'舒適'},{v:'dense',l:'緊湊'}]} />
      </div>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================
function markNode(tree, id, patch) {
  return tree.map((n) => {
    if (n.type === 'dir') return { ...n, children: markNode(n.children, id, patch) };
    if (n.id === id) return { ...n, ...patch };
    return n;
  });
}
function toggleDirIn(tree, target) {
  return tree.map((n) => {
    if (n === target || (n.type === 'dir' && n.name === target.name)) {
      return { ...n, expanded: !n.expanded };
    }
    if (n.type === 'dir') return { ...n, children: toggleDirIn(n.children, target) };
    return n;
  });
}
function countDirty(tree) {
  let n = 0;
  const walk = (xs) => xs.forEach((x) => x.type === 'dir' ? walk(x.children) : (x.dirty && n++));
  walk(tree);
  return n;
}
function gitChanges(tree, files) {
  const out = [];
  const walk = (xs) => xs.forEach((x) => {
    if (x.type === 'dir') return walk(x.children);
    if (x.git || x.dirty) out.push({ id: x.id, name: x.name, status: x.dirty ? 'M' : x.git });
  });
  walk(tree);
  return out;
}

window.App = App;
