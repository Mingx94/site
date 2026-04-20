// Syntax highlight the svx source code in the editor pane
window.highlightSvx = function(src) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = src.split('\n');
  let inFence = false;
  return lines.map((raw) => {
    let l = esc(raw);
    if (raw.startsWith('```')) {
      inFence = !inFence;
      return `<span class="sx-fence">${l}</span>`;
    }
    if (inFence) return `<span class="sx-code">${l}</span>`;
    // Headings
    l = l.replace(/^(#{1,4})\s(.*)$/, '<span class="sx-h">$1 $2</span>');
    // Svelte components
    l = l.replace(/(&lt;\/?)([A-Z]\w+)([^&]*?)(&gt;)/g,
      '<span class="sx-tag">$1</span><span class="sx-comp">$2</span><span class="sx-attr">$3</span><span class="sx-tag">$4</span>');
    // Links
    l = l.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<span class="sx-link">[$1]</span><span class="sx-url">($2)</span>');
    // Inline code
    l = l.replace(/`([^`]+)`/g, '<span class="sx-ic">`$1`</span>');
    // Bold/italic
    l = l.replace(/\*\*([^*]+)\*\*/g, '<span class="sx-b">**$1**</span>');
    return l || '&nbsp;';
  }).join('\n');
};

// Word count helper
window.wordCount = function(s) {
  if (!s) return 0;
  const cn = (s.match(/[\u4e00-\u9fff]/g) || []).length;
  const en = (s.match(/[a-zA-Z]+/g) || []).length;
  return cn + en;
};

// Serialize frontmatter back to yaml-ish string
window.serializeFrontmatter = function(fm) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (Array.isArray(v)) lines.push(`${k}: [${v.join(', ')}]`);
    else if (typeof v === 'boolean') lines.push(`${k}: ${v}`);
    else lines.push(`${k}: "${v}"`);
  }
  lines.push('---');
  return lines.join('\n');
};
