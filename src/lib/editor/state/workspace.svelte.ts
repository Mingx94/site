import {
  readTree,
  createFileRel,
  createDirRel,
  deleteFileRel,
  deleteDirRel,
  renamePathRel,
  type TreeNode,
} from '$lib/editor/io/fs-access';
import { renamePathInFiles, forgetFilesUnder } from './files.svelte';
import { renamePathInTabs, closeTabsUnder } from './tabs.svelte';

type WorkspaceState = {
  // Display label, fixed to 'content' (site/src/content). Editor doesn't
  // have a workspace picker any more — the dev-only Vite middleware
  // pins the workspace to a known location.
  rootName: string;
  // Convenience: same as rootName, used by old call sites that gate on
  // "is a workspace open?".
  root: string;
  tree: TreeNode[];
  // Set of expanded directory paths (relative).
  expanded: Set<string>;
  loading: boolean;
  error: string | null;
};

export const workspace = $state<WorkspaceState>({
  rootName: 'content',
  root: 'content',
  tree: [],
  expanded: new Set<string>(),
  loading: false,
  error: null,
});

export async function loadWorkspace(): Promise<void> {
  workspace.loading = true;
  workspace.error = null;
  try {
    workspace.tree = await readTree();
  } catch (e) {
    workspace.error = (e as Error).message;
  } finally {
    workspace.loading = false;
  }
}

export const refreshTree = loadWorkspace;

export function toggleDir(path: string) {
  if (workspace.expanded.has(path)) workspace.expanded.delete(path);
  else workspace.expanded.add(path);
  workspace.expanded = new Set(workspace.expanded);
}

export function setExpanded(path: string, on: boolean) {
  if (on) workspace.expanded.add(path);
  else workspace.expanded.delete(path);
  workspace.expanded = new Set(workspace.expanded);
}

function joinPath(parent: string, name: string): string {
  return parent ? `${parent}/${name}` : name;
}

// CRUD actions — server-call + tree refresh + state book-keeping.
// Each throws on validation / IO failure; caller (UI) surfaces errors.

export async function createFile(parentDir: string, name: string): Promise<string> {
  if (!name.trim()) throw new Error('檔名不能為空');
  const path = joinPath(parentDir, name.trim());
  await createFileRel(path);
  setExpanded(parentDir, true);
  await refreshTree();
  return path;
}

export async function createDir(parentDir: string, name: string): Promise<string> {
  if (!name.trim()) throw new Error('資料夾名稱不能為空');
  const path = joinPath(parentDir, name.trim());
  await createDirRel(path);
  setExpanded(parentDir, true);
  setExpanded(path, true);
  await refreshTree();
  return path;
}

// Shared post-rename bookkeeping. Server has already moved the path; we
// rewrite cached file buffers, open tabs, and the expanded set in lockstep
// so the UI doesn't blink to a stale state before refreshTree returns.
async function applyRename(oldPath: string, newPath: string): Promise<void> {
  if (newPath === oldPath) return;
  if (newPath === oldPath || newPath.startsWith(oldPath + '/')) {
    throw new Error('不能將項目移入自己或子層');
  }
  await renamePathRel(oldPath, newPath);
  renamePathInFiles(oldPath, newPath);
  renamePathInTabs(oldPath, newPath);
  const prevExpanded = [...workspace.expanded];
  workspace.expanded = new Set(
    prevExpanded.map((p) =>
      p === oldPath || p.startsWith(oldPath + '/')
        ? newPath + p.slice(oldPath.length)
        : p,
    ),
  );
  await refreshTree();
}

export async function renamePath(oldPath: string, newName: string): Promise<string> {
  if (!newName.trim()) throw new Error('名稱不能為空');
  const segs = oldPath.split('/');
  segs[segs.length - 1] = newName.trim();
  const newPath = segs.join('/');
  if (newPath === oldPath) return oldPath;
  await applyRename(oldPath, newPath);
  return newPath;
}

// Drag-drop: move a file or directory into a different parent directory.
// `destDir` is workspace-relative ('' = root). The basename is preserved.
export async function movePath(srcPath: string, destDir: string): Promise<string> {
  const name = srcPath.split('/').pop();
  if (!name) throw new Error(`bad source path: ${srcPath}`);
  const newPath = destDir ? `${destDir}/${name}` : name;
  if (newPath === srcPath) return srcPath; // dropped on own parent — no-op
  await applyRename(srcPath, newPath);
  return newPath;
}

export async function deletePath(path: string, isDir: boolean): Promise<void> {
  if (isDir) await deleteDirRel(path);
  else await deleteFileRel(path);
  closeTabsUnder(path);
  forgetFilesUnder(path);
  workspace.expanded.delete(path);
  workspace.expanded = new Set(workspace.expanded);
  await refreshTree();
}
