import { loadFile } from './files.svelte';

type TabsState = {
  open: string[];
  active: string | null;
  previewMode: 'split' | 'edit' | 'preview';
  railOpen: boolean;
  railTab: 'fm' | 'toc' | 'comp';
};

export const tabs = $state<TabsState>({
  open: [],
  active: null,
  previewMode: 'split',
  railOpen: true,
  railTab: 'fm',
});

export async function openTab(path: string): Promise<void> {
  await loadFile(path);
  if (!tabs.open.includes(path)) tabs.open = [...tabs.open, path];
  tabs.active = path;
}

export function closeTab(path: string) {
  const idx = tabs.open.indexOf(path);
  if (idx === -1) return;
  const next = tabs.open.filter((p) => p !== path);
  tabs.open = next;
  if (tabs.active === path) {
    tabs.active = next[Math.max(0, idx - 1)] ?? null;
  }
}

export function setActive(path: string) {
  if (tabs.open.includes(path)) tabs.active = path;
}

export function setPreviewMode(mode: TabsState['previewMode']) {
  tabs.previewMode = mode;
}

export function toggleRail() {
  tabs.railOpen = !tabs.railOpen;
}

export function setRailTab(t: TabsState['railTab']) {
  tabs.railTab = t;
}

function pathMatchesPrefix(p: string, prefix: string): boolean {
  return p === prefix || p.startsWith(prefix + '/');
}

// After a rename / move, rewrite any open tab paths that match.
export function renamePathInTabs(oldPrefix: string, newPrefix: string): void {
  tabs.open = tabs.open.map((p) =>
    pathMatchesPrefix(p, oldPrefix)
      ? newPrefix + p.slice(oldPrefix.length)
      : p,
  );
  if (tabs.active && pathMatchesPrefix(tabs.active, oldPrefix)) {
    tabs.active = newPrefix + tabs.active.slice(oldPrefix.length);
  }
}

// After a delete, close any open tab matching the prefix.
export function closeTabsUnder(prefixPath: string): void {
  const next = tabs.open.filter((p) => !pathMatchesPrefix(p, prefixPath));
  tabs.open = next;
  if (tabs.active && pathMatchesPrefix(tabs.active, prefixPath)) {
    tabs.active = next[0] ?? null;
  }
}
