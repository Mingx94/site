import { readFileRel, writeFileRel } from '$lib/io/fs-access';

export type FileEntry = {
  // Workspace-relative path, e.g. 'posts/why-astro/article.svx'.
  path: string;
  name: string;
  content: string;
  diskContent: string;
};

type FilesState = {
  byPath: Record<string, FileEntry>;
};

export const files = $state<FilesState>({
  byPath: {},
});

function nameOf(path: string): string {
  return path.split('/').pop() ?? path;
}

export function isDirty(path: string): boolean {
  const f = files.byPath[path];
  return !!f && f.content !== f.diskContent;
}

export function dirtyCount(): number {
  let n = 0;
  for (const p in files.byPath) if (isDirty(p)) n++;
  return n;
}

export async function loadFile(path: string): Promise<FileEntry> {
  const existing = files.byPath[path];
  if (existing) return existing;
  const content = await readFileRel(path);
  const entry: FileEntry = {
    path,
    name: nameOf(path),
    content,
    diskContent: content,
  };
  files.byPath[path] = entry;
  return entry;
}

export function updateContent(path: string, content: string) {
  const f = files.byPath[path];
  if (!f) return;
  f.content = content;
}

export async function saveFile(path: string): Promise<void> {
  const f = files.byPath[path];
  if (!f) return;
  await writeFileRel(path, f.content);
  f.diskContent = f.content;
}

export async function reloadFromDisk(path: string): Promise<void> {
  const f = files.byPath[path];
  if (!f) return;
  const content = await readFileRel(path);
  f.content = content;
  f.diskContent = content;
}

export function forgetFile(path: string) {
  delete files.byPath[path];
}

// True when `p` equals `prefix` or sits underneath it (i.e. starts with
// `prefix/`). Used after a rename or directory delete.
function pathMatchesPrefix(p: string, prefix: string): boolean {
  return p === prefix || p.startsWith(prefix + '/');
}

// Rewrite the keys for any cached file whose path is `oldPrefix` or sits
// inside that directory, replacing the prefix with `newPrefix`. Use after
// a rename / move on the server.
export function renamePathInFiles(oldPrefix: string, newPrefix: string): void {
  const next: Record<string, FileEntry> = {};
  for (const [p, entry] of Object.entries(files.byPath)) {
    if (pathMatchesPrefix(p, oldPrefix)) {
      const np = newPrefix + p.slice(oldPrefix.length);
      next[np] = { ...entry, path: np, name: nameOf(np) };
    } else {
      next[p] = entry;
    }
  }
  files.byPath = next;
}

// Drop any cached file at `prefixPath` or under that directory. Use after
// a delete on the server.
export function forgetFilesUnder(prefixPath: string): void {
  for (const p of Object.keys(files.byPath)) {
    if (pathMatchesPrefix(p, prefixPath)) delete files.byPath[p];
  }
}
