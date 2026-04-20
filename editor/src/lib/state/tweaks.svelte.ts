import { loadTweaks as loadFromStorage, saveTweaks } from '$lib/io/persist';

export type Tweaks = {
  paperTone: 'warm' | 'cool' | 'neutral';
  accent: 'red' | 'blue' | 'green' | 'purple';
  editorFont: 'mono' | 'serif' | 'hand';
  density: 'cozy' | 'dense';
  panelOpen: boolean;
};

const DEFAULT: Tweaks = {
  paperTone: 'warm',
  accent: 'red',
  editorFont: 'mono',
  density: 'cozy',
  panelOpen: false,
};

export const tweaks = $state<Tweaks>({ ...DEFAULT });

const ACCENT_HEX = {
  red: '#b2462d',
  blue: '#2d5d9e',
  green: '#3a6b52',
  purple: '#6b4a9c',
} as const;

const PAPER_HEX = {
  warm: { paper: '#f3ede0', paper2: '#ebe3d1', card: '#fffdf6' },
  cool: { paper: '#e9ece9', paper2: '#dde2dd', card: '#ffffff' },
  neutral: { paper: '#ececea', paper2: '#e0e0dd', card: '#ffffff' },
} as const;

const FONT_FAM = {
  mono: '"JetBrains Mono", ui-monospace, monospace',
  serif: '"Newsreader", "Noto Serif TC", serif',
  hand: '"Kalam", "Caveat", cursive',
} as const;

function apply(next: Tweaks) {
  const root = document.documentElement;
  const tone = PAPER_HEX[next.paperTone];
  root.style.setProperty('--paper', tone.paper);
  root.style.setProperty('--paper-2', tone.paper2);
  root.style.setProperty('--paper-card', tone.card);
  root.style.setProperty('--accent', ACCENT_HEX[next.accent]);
  root.style.setProperty('--editor-font', FONT_FAM[next.editorFont]);
  document.body.classList.toggle('dense', next.density === 'dense');
}

export async function loadTweaks(): Promise<void> {
  const saved = loadFromStorage<Partial<Tweaks>>();
  const merged = { ...DEFAULT, ...(saved ?? {}) };
  Object.assign(tweaks, merged);
  apply(tweaks);
}

export async function setTweak<K extends keyof Tweaks>(
  key: K,
  value: Tweaks[K],
): Promise<void> {
  tweaks[key] = value;
  apply(tweaks);
  saveTweaks({ ...tweaks });
}

export function togglePanel() {
  tweaks.panelOpen = !tweaks.panelOpen;
}
