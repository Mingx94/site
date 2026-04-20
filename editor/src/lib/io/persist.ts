// Tweaks live in localStorage so they survive page reloads. Workspace
// recents are no longer needed — the workspace is fixed to site/src/content.

const LS_TWEAKS = 'svx-editor.tweaks';

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
