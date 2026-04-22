// YAML frontmatter parsing / serialization for the editor. Uses `js-yaml`
// so the behaviour matches mdsvex (which uses gray-matter → js-yaml) —
// that means list syntax, multiline strings, nested objects, comments,
// and quoted dates all round-trip correctly instead of the previous
// home-rolled regex parser which silently destroyed non-trivial YAML.

import yaml from 'js-yaml';

export type Frontmatter = Record<string, unknown>;

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseDoc(src: string): { fm: Frontmatter; body: string } {
  const m = src.match(FM_RE);
  if (!m) return { fm: {}, body: src };
  try {
    const parsed = yaml.load(m[1]);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { fm: {}, body: m[2] };
    }
    // js-yaml parses unquoted `YYYY-MM-DD` values as JavaScript `Date`
    // objects (YAML 1.1 timestamp behaviour). Downstream the editor UI
    // (`<input type="date">`) wants plain strings, and `yaml.dump` of a
    // Date emits a full ISO timestamp with a `Z` suffix on save — which
    // means any edit rewrites `date: 2025-02-02` to
    // `date: 2025-02-02T00:00:00.000Z` on disk. Normalize once at parse
    // time so everything downstream treats dates as simple strings.
    return { fm: normalizeDatesDeep(parsed as Frontmatter), body: m[2] };
  } catch {
    // Malformed YAML — return empty frontmatter rather than throwing so
    // the editor can still open the file and let the user fix it.
    return { fm: {}, body: m[2] };
  }
}

function normalizeDatesDeep<T>(v: T): T {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, '0');
    const d = String(v.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}` as T;
  }
  if (Array.isArray(v)) return v.map(normalizeDatesDeep) as T;
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) out[k] = normalizeDatesDeep(val);
    return out as T;
  }
  return v;
}

// YYYY-MM-DD at top level, preceded by a key and optionally wrapped in
// single or double quotes that js-yaml emits defensively. Used to undo
// that defensive quoting so the on-disk `.svx` stays `date: 2025-02-02`
// rather than drifting to `date: "2025-02-02"` after the first edit.
const DATE_QUOTING_RE =
  /^(\s*[A-Za-z_][\w-]*:\s*)(['"])(\d{4}-\d{2}-\d{2})\2(\s*)$/gm;

export function serializeFrontmatter(fm: Frontmatter): string {
  const keys = Object.keys(fm);
  if (!keys.length) return '';
  // `noCompatMode` avoids YAML-1.1 scalar-tag footguns; `lineWidth: -1`
  // disables line folding so multi-paragraph strings round-trip verbatim.
  const dumped = yaml
    .dump(fm, {
      noCompatMode: true,
      lineWidth: -1,
      quotingType: '"',
    })
    .trimEnd();
  // js-yaml quotes any `YYYY-MM-DD` string defensively, in case a reader
  // uses the YAML-1.1 schema and would reinterpret it as a timestamp.
  // mdsvex + the rest of the site use the default schema where unquoted
  // dates parse back to Date just fine, so strip the quotes to keep
  // edits from drifting the on-disk format.
  const unquoted = dumped.replace(DATE_QUOTING_RE, '$1$3$4');
  return `---\n${unquoted}\n---`;
}

export function composeDoc(fm: Frontmatter, body: string): string {
  const fmStr = serializeFrontmatter(fm);
  if (!fmStr) return body;
  return `${fmStr}\n\n${body}`;
}
