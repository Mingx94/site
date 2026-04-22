export function wordCount(s: string): number {
  if (!s) return 0;
  const cn = (s.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const en = (s.match(/[a-zA-Z]+/g) ?? []).length;
  return cn + en;
}

export function readingTime(words: number): number {
  return Math.max(1, Math.ceil(words / 280));
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function basename(path: string): string {
  return path.split(/[/\\]/).pop() ?? path;
}

export function relativePath(root: string, abs: string): string {
  const normRoot = root.replaceAll('\\', '/');
  const normAbs = abs.replaceAll('\\', '/');
  if (normAbs.startsWith(normRoot + '/')) return normAbs.slice(normRoot.length + 1);
  if (normAbs === normRoot) return '';
  return normAbs;
}
