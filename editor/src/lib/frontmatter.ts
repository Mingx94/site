export type Frontmatter = Record<string, unknown>;

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseDoc(src: string): { fm: Frontmatter; body: string } {
  const m = src.match(FM_RE);
  if (!m) return { fm: {}, body: src };
  const fm: Frontmatter = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) continue;
    let v: unknown = mm[2].trim();
    if (typeof v === 'string') {
      if (v.startsWith('[') && v.endsWith(']')) {
        v = v
          .slice(1, -1)
          .split(',')
          .map((x) => x.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else if (v === 'true') v = true;
      else if (v === 'false') v = false;
      else if (/^-?\d+(?:\.\d+)?$/.test(v)) v = Number(v);
      else v = (v as string).replace(/^["']|["']$/g, '');
    }
    fm[mm[1]] = v;
  }
  return { fm, body: m[2] };
}

export function serializeFrontmatter(fm: Frontmatter): string {
  const keys = Object.keys(fm);
  if (!keys.length) return '';
  const lines = ['---'];
  for (const k of keys) {
    const v = fm[k];
    if (Array.isArray(v)) {
      lines.push(`${k}: [${(v as unknown[]).map(String).join(', ')}]`);
    } else if (typeof v === 'boolean' || typeof v === 'number') {
      lines.push(`${k}: ${v}`);
    } else if (v === null || v === undefined) {
      lines.push(`${k}: null`);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) {
      lines.push(`${k}: ${v}`);
    } else {
      lines.push(`${k}: "${String(v).replace(/"/g, '\\"')}"`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

export function composeDoc(fm: Frontmatter, body: string): string {
  const fmStr = serializeFrontmatter(fm);
  if (!fmStr) return body;
  return `${fmStr}\n\n${body}`;
}
