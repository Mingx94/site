import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// Paper theme: everything reads from the app's CSS variables so Tweaks
// (paperTone / accent / editorFont / density) propagate live without
// rebuilding the extension tree.
export const paperTheme = EditorView.theme(
  {
    '&': {
      color: 'var(--ink)',
      backgroundColor: 'transparent',
      fontFamily: 'var(--editor-font)',
      fontSize: '13.5px',
      height: '100%',
    },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': {
      fontFamily: 'var(--editor-font)',
      lineHeight: '1.7',
    },
    '.cm-content': {
      padding: '14px 4px',
      caretColor: 'var(--accent)',
    },
    '.cm-line': { padding: '0 18px 0 0' },
    '.cm-gutters': {
      backgroundColor: 'var(--paper-2)',
      borderRight: '1px solid var(--line)',
      color: 'var(--ink-ghost)',
      fontFamily: 'var(--mono)',
      fontSize: '12px',
    },
    '.cm-gutterElement': { padding: '0 8px 0 4px' },
    '.cm-lineNumbers': { minWidth: '34px' },
    '.cm-activeLineGutter': {
      color: 'var(--ink-soft)',
      backgroundColor: 'transparent',
    },
    '.cm-activeLine': { backgroundColor: 'rgba(178, 70, 45, 0.035)' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--accent)' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection':
      { backgroundColor: 'rgba(178, 70, 45, 0.22)' },
    '.cm-selectionMatch': {
      backgroundColor: 'rgba(178, 70, 45, 0.14)',
      outline: '1px solid rgba(178, 70, 45, 0.3)',
    },
    '.cm-matchingBracket': {
      color: 'var(--accent)',
      backgroundColor: 'rgba(178, 70, 45, 0.1)',
    },
    '.cm-panels': {
      backgroundColor: 'var(--paper-2)',
      color: 'var(--ink)',
      borderBottom: '1px solid var(--line-hard)',
    },
    '.cm-panel.cm-search': {
      padding: '6px 10px',
      fontFamily: 'var(--serif)',
    },
    '.cm-panel input, .cm-panel button': {
      fontFamily: 'var(--mono)',
      fontSize: '12px',
      backgroundColor: 'var(--paper-card)',
      color: 'var(--ink)',
      border: '1px solid var(--line-hard)',
      borderRadius: '3px',
      padding: '2px 6px',
    },
    '.cm-searchMatch': {
      backgroundColor: 'rgba(198, 129, 39, 0.25)',
      outline: '1px solid rgba(198, 129, 39, 0.6)',
    },
    '.cm-searchMatch-selected': {
      backgroundColor: 'rgba(178, 70, 45, 0.35)',
    },
    '.cm-tooltip': {
      backgroundColor: 'var(--paper-card)',
      color: 'var(--ink)',
      border: '1px solid var(--ink)',
      fontFamily: 'var(--serif)',
    },
  },
  { dark: false },
);

// Syntax colors — mapped to paper palette.
const paperHighlight = HighlightStyle.define([
  {
    tag: [t.heading, t.heading1, t.heading2, t.heading3, t.heading4, t.heading5, t.heading6],
    color: 'var(--accent)',
    fontWeight: '700',
  },
  { tag: t.link, color: 'var(--accent)' },
  { tag: t.url, color: 'var(--ink-fade)', textDecoration: 'underline dotted' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strong, fontWeight: '700', color: 'var(--ink)' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  {
    tag: t.monospace,
    color: 'var(--accent-2)',
    backgroundColor: 'rgba(58, 107, 82, 0.08)',
  },
  { tag: t.quote, color: 'var(--ink-soft)', fontStyle: 'italic' },
  { tag: t.list, color: 'var(--accent)' },
  { tag: t.contentSeparator, color: 'var(--ink-fade)' },
  // HTML / Svelte tag highlighting (SVX components)
  { tag: t.tagName, color: 'var(--accent-2)', fontWeight: '600' },
  { tag: t.bracket, color: 'var(--ink-ghost)' },
  { tag: t.angleBracket, color: 'var(--ink-ghost)' },
  { tag: t.attributeName, color: 'var(--warning)' },
  { tag: t.attributeValue, color: 'var(--ink-soft)' },
  // Frontmatter (YAML-ish) — meta tag gets mapped for frontmatter nodes
  { tag: t.meta, color: 'var(--warning)', fontStyle: 'italic' },
  // Generic code token fallbacks for fenced blocks
  { tag: t.keyword, color: 'var(--accent)' },
  { tag: t.string, color: 'var(--accent-2)' },
  { tag: t.number, color: 'var(--warning)' },
  { tag: t.comment, color: 'var(--ink-ghost)', fontStyle: 'italic' },
  { tag: t.variableName, color: 'var(--ink)' },
  { tag: t.typeName, color: 'var(--accent-2)' },
  { tag: t.function(t.variableName), color: 'var(--accent-2)' },
]);

export const paperSyntax = syntaxHighlighting(paperHighlight);
