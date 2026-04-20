// ============================================================
// FileTree — recursive tree with folders, files, git status
// ============================================================
function FileTree({ tree, openFiles, activeId, onOpen, onToggleDir }) {
  const renderNode = (node, depth) => {
    if (node.type === 'dir') {
      return (
        <div key={node.name + depth}>
          <div
            className="ft-node ft-dir"
            style={{ paddingLeft: 8 + depth * 14 }}
            onClick={() => onToggleDir(node)}
          >
            <span className="ft-caret">{node.expanded ? '▾' : '▸'}</span>
            <span className="ft-ico">◱</span>
            <span className="ft-name">{node.name}</span>
          </div>
          {node.expanded && node.children.map((c) => renderNode(c, depth + 1))}
        </div>
      );
    }
    const isActive = activeId === node.id;
    const isOpen = openFiles.includes(node.id);
    const ext = node.name.split('.').pop();
    const icons = { svx: '✎', md: '✐', png: '▤', svg: '▤', jpg: '▤' };
    return (
      <div
        key={node.id}
        className={`ft-node ft-file ${isActive ? 'active' : ''} ${isOpen ? 'open' : ''}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => onOpen(node.id)}
      >
        <span className="ft-ico">{icons[ext] || '·'}</span>
        <span className="ft-name">{node.name}</span>
        <span className="ft-meta">
          {node.dirty && <span className="ft-dirty">●</span>}
          {node.git && <span className={`ft-git g-${node.git.toLowerCase().replace('?', 'u')}`}>{node.git}</span>}
        </span>
      </div>
    );
  };
  return <div className="ft">{tree.map((n) => renderNode(n, 0))}</div>;
}

// ============================================================
// TabBar
// ============================================================
function TabBar({ openFiles, activeId, files, onActivate, onClose }) {
  return (
    <div className="tabs">
      {openFiles.map((id) => {
        const f = files[id];
        if (!f) return null;
        const isActive = id === activeId;
        return (
          <div
            key={id}
            className={`tab ${isActive ? 'active' : ''}`}
            onClick={() => onActivate(id)}
          >
            <span className="tab-ico">✎</span>
            <span className="tab-name">{f.name}</span>
            <button
              className="tab-x"
              onClick={(e) => { e.stopPropagation(); onClose(id); }}
            >×</button>
          </div>
        );
      })}
      <div className="tab-fill"></div>
    </div>
  );
}

// ============================================================
// Toolbar — markdown formatting buttons
// ============================================================
function Toolbar({ onAction, previewMode, onTogglePreview, onToggleRail, railOpen }) {
  const Btn = ({ act, label, title, cls }) => (
    <button
      className={`tbtn ${cls || ''}`}
      title={title}
      onClick={() => onAction(act)}
    >{label}</button>
  );
  return (
    <div className="toolbar">
      <Btn act="bold" label="B" title="粗體 ⌘B" cls="b" />
      <Btn act="italic" label="I" title="斜體 ⌘I" cls="i" />
      <Btn act="strike" label="S" title="刪除線" cls="s" />
      <div className="tsep"></div>
      <Btn act="h1" label="H1" title="標題 1" />
      <Btn act="h2" label="H2" title="標題 2" />
      <Btn act="h3" label="H3" title="標題 3" />
      <div className="tsep"></div>
      <Btn act="link" label="🔗" title="連結 ⌘K" />
      <Btn act="code" label="&lt;/&gt;" title="程式碼" />
      <Btn act="quote" label="❝" title="引用" />
      <Btn act="ul" label="• ─" title="清單" />
      <Btn act="ol" label="1. ─" title="編號清單" />
      <Btn act="task" label="☐" title="待辦" />
      <div className="tsep"></div>
      <Btn act="hr" label="— —" title="分隔線" />
      <div className="tfill"></div>
      <div className="preview-seg">
        <button className={previewMode === 'split' ? 'on' : ''} onClick={() => onTogglePreview('split')}>並排</button>
        <button className={previewMode === 'edit' ? 'on' : ''} onClick={() => onTogglePreview('edit')}>只編輯</button>
        <button className={previewMode === 'preview' ? 'on' : ''} onClick={() => onTogglePreview('preview')}>只預覽</button>
      </div>
      <button className="tbtn rail-toggle" title="右欄" onClick={onToggleRail}>
        {railOpen ? '▸│' : '│▸'}
      </button>
    </div>
  );
}

Object.assign(window, { FileTree, TabBar, Toolbar });
