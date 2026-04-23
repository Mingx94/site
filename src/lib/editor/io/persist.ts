// Tweaks live in localStorage so they survive page reloads. Workspace
// recents are no longer needed — the workspace is fixed to site/src/content.

const LS_TWEAKS = 'svx-editor.tweaks';
const LS_DIRTY_PREFIX = 'svx-editor.dirty:';
const LS_TABS = 'svx-editor.tabs';

export type TabsSnapshot = { open: string[]; active: string | null };

export function loadTabsSnapshot(): TabsSnapshot | null {
  try {
    const raw = localStorage.getItem(LS_TABS);
    return raw ? (JSON.parse(raw) as TabsSnapshot) : null;
  } catch {
    return null;
  }
}

export function saveTabsSnapshot(snap: TabsSnapshot): void {
  try {
    localStorage.setItem(LS_TABS, JSON.stringify(snap));
  } catch {
    /* quota / disabled — tabs will still work in-session */
  }
}

export function loadTweaks<T>(): T | null {
  try {
    const raw = localStorage.getItem(LS_TWEAKS);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveTweaks(value: unknown): void {
  try {
    localStorage.setItem(LS_TWEAKS, JSON.stringify(value));
  } catch {
    /* quota / disabled — silently ignore, tweaks aren't critical */
  }
}

// --------------------------------------------------------------------------
// Dirty-buffer persistence.
//
// The editor holds all file state in memory (`files.svelte.ts:byPath`).
// A browser reload, Vite restart, or `location = location` while the user
// has unsaved typing in a tab would lose every keystroke. We mirror dirty
// content into localStorage keyed by path and rehydrate on mount.
//
// Each entry stores both the author's pending `content` and the
// `diskContent` the buffer was forked from — that lets us detect if disk
// drifted while the tab was gone (external edit) and show a conflict.
// --------------------------------------------------------------------------

export type DirtySnapshot = {
  path: string;
  content: string;
  diskContent: string;
  // When the snapshot was written — millis since epoch. Used to evict
  // very old entries if they ever get orphaned.
  savedAt: number;
};

function dirtyKey(path: string): string {
  return LS_DIRTY_PREFIX + path;
}

export function saveDirtySnapshot(snap: DirtySnapshot): void {
  try {
    localStorage.setItem(dirtyKey(snap.path), JSON.stringify(snap));
  } catch {
    /* quota full — buffer is ephemeral in that case; don't block saves */
  }
}

export function readDirtySnapshot(path: string): DirtySnapshot | null {
  try {
    const raw = localStorage.getItem(dirtyKey(path));
    return raw ? (JSON.parse(raw) as DirtySnapshot) : null;
  } catch {
    return null;
  }
}

export function clearDirtySnapshot(path: string): void {
  try {
    localStorage.removeItem(dirtyKey(path));
  } catch {
    /* ignore */
  }
}

// Enumerate every dirty snapshot currently in storage. Used on boot to
// rehydrate tabs that had unsaved edits at last teardown.
export function listDirtySnapshots(): DirtySnapshot[] {
  const out: DirtySnapshot[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(LS_DIRTY_PREFIX)) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        out.push(JSON.parse(raw) as DirtySnapshot);
      } catch {
        /* skip malformed */
      }
    }
  } catch {
    /* localStorage disabled — no restore */
  }
  return out;
}
