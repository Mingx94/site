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
    const fm =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Frontmatter)
        : {};
    return { fm, body: m[2] };
  } catch {
    // Malformed YAML — return empty frontmatter rather than throwing so
    // the editor can still open the file and let the user fix it.
    return { fm: {}, body: m[2] };
  }
}

export function serializeFrontmatter(fm: Frontmatter): string {
  const keys = Object.keys(fm);
  if (!keys.length) return '';
  // `noCompatMode` avoids quoting ISO dates and other YAML-1.1 footguns;
  // `lineWidth: -1` disables line folding (we want multi-paragraph strings
  // to round-trip verbatim).
  const dumped = yaml
    .dump(fm, {
      noCompatMode: true,
      lineWidth: -1,
      quotingType: '"',
    })
    .trimEnd();
  return `---\n${dumped}\n---`;
}

export function composeDoc(fm: Frontmatter, body: string): string {
  const fmStr = serializeFrontmatter(fm);
  if (!fmStr) return body;
  return `${fmStr}\n\n${body}`;
}
