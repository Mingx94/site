import type { Extension } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
} from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {
  indentOnInput,
  bracketMatching,
} from '@codemirror/language';
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

import { paperTheme, paperSyntax } from './theme';

type Hooks = {
  onDocChange: (doc: string) => void;
  onDrop: (e: DragEvent, view: EditorView) => void;
};

// Keys that App.svelte handles at window level — don't let CM eat them.
const RESERVED_KEYS = new Set([
  'Mod-k',
  'Mod-s',
  'Mod-w',
  'Mod-o',
  'Mod-\\',
]);

function stripReserved<T extends { key?: string; mac?: string }>(km: readonly T[]): T[] {
  return km.filter((b) => {
    const k = b.key ?? b.mac;
    return !k || !RESERVED_KEYS.has(k);
  });
}

export function baseExtensions(hooks: Hooks): Extension[] {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    history(),
    dropCursor(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightSelectionMatches(),
    EditorView.lineWrapping,
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
      addKeymap: true,
    }),
    paperSyntax,
    paperTheme,
    search({ top: true }),
    keymap.of([
      ...stripReserved(closeBracketsKeymap),
      ...stripReserved(defaultKeymap),
      ...stripReserved(searchKeymap),
      ...stripReserved(historyKeymap),
      ...stripReserved(completionKeymap),
      indentWithTab,
    ]),
    EditorView.updateListener.of((u) => {
      if (u.docChanged) hooks.onDocChange(u.state.doc.toString());
    }),
    EditorView.domEventHandlers({
      drop(e, view) {
        hooks.onDrop(e, view);
      },
      dragover(e) {
        e.preventDefault();
      },
    }),
  ];
}
