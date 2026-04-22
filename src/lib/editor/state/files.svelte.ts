import {
  readFileRelWithEtag,
  writeFileRel,
  SaveConflictError,
} from '$lib/editor/io/fs-access';
import {
  clearDirtySnapshot,
  listDirtySnapshots,
  readDirtySnapshot,
  saveDirtySnapshot,
} from '$lib/editor/io/persist';

// Re-export so callers can catch by type without reaching into $lib/io.
export { SaveConflictError };

export type FileEntry = {
  // Workspace-relative path, e.g. 'posts/why-astro/article.svx'.
  path: string;
  name: string;
  content: string;
  diskContent: string;
  // Server etag of the on-disk content at the last read/write. Echoed on
  // save via If-Match so a second editor that touched the file in the
  // meantime triggers a 409 conflict instead of a silent clobber.
  etag: string | null;
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

// Debounced dirty-buffer persistence. Each keystroke enqueues a snapshot
// write ~300ms later; clean buffers clear their snapshot immediately so a
// saved file doesn't linger in storage.
const persistTimers = new Map<string, ReturnType<typeof setTimeout>>();
function schedulePersist(path: string): void {
  const existing = persistTimers.get(path);
  if (existing) clearTimeout(existing);
  const t = setTimeout(() => {
    persistTimers.delete(path);
    const f = files.byPath[path];
    if (!f) return;
    if (f.content === f.diskContent) {
      clearDirtySnapshot(path);
    } else {
      saveDirtySnapshot({
        path,
        content: f.content,
        diskContent: f.diskContent,
        savedAt: Date.now(),
      });
    }
  }, 300);
  persistTimers.set(path, t);
}

// Fetch disk + maybe restore dirty snapshot. A snapshot whose diskContent
// matches what's on disk now is safe to restore (user had unsaved work);
// a snapshot where diskContent differs means disk changed externally while
// the tab was gone — safer to drop the snapshot and show the fresh disk
// content than to silently clobber the external edit on next save.
export async function loadFile(path: string): Promise<FileEntry> {
  const existing = files.byPath[path];
  if (existing) return existing;
  const { content: disk, etag } = await readFileRelWithEtag(path);
  const snap = readDirtySnapshot(path);
  const content =
    snap && snap.diskContent === disk && snap.content !== disk
      ? snap.content
      : disk;
  if (snap && snap.diskContent !== disk) clearDirtySnapshot(path);
  const entry: FileEntry = {
    path,
    name: nameOf(path),
    content,
    diskContent: disk,
    etag,
  };
  files.byPath[path] = entry;
  return entry;
}

export function updateContent(path: string, content: string) {
  const f = files.byPath[path];
  if (!f) return;
  f.content = content;
  schedulePersist(path);
}

// Save the current buffer to disk. If `overwrite` is false (the default),
// the server validates the ETag we picked up at last load/save — a disk
// edit since then throws `SaveConflictError`, which the UI should catch
// and surface (usually "external change detected, overwrite anyway?").
export async function saveFile(
  path: string,
  overwrite = false,
): Promise<void> {
  const f = files.byPath[path];
  if (!f) return;
  const newEtag = await writeFileRel(
    path,
    f.content,
    overwrite ? null : f.etag,
  );
  f.diskContent = f.content;
  f.etag = newEtag;
  clearDirtySnapshot(path);
}

export async function reloadFromDisk(path: string): Promise<void> {
  const f = files.byPath[path];
  if (!f) return;
  const { content, etag } = await readFileRelWithEtag(path);
  f.content = content;
  f.diskContent = content;
  f.etag = etag;
  clearDirtySnapshot(path);
}

export function forgetFile(path: string) {
  delete files.byPath[path];
  clearDirtySnapshot(path);
}

// Boot-time restore: returns the list of paths that had a dirty snapshot
// at teardown. The caller (App.svelte) then openTab's each one — that
// goes through loadFile, which reads the snapshot, reconciles it against
// fresh disk content, and populates `byPath` with the correct etag.
export function restoreDirtySnapshots(): string[] {
  return listDirtySnapshots().map((s) => s.path);
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
