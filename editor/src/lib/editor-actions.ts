import type { EditorView } from '@codemirror/view';

export type ToolbarCmd =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'code'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'link'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'task'
  | 'hr';

let active: EditorView | null = null;

export function registerEditor(view: EditorView): void {
  active = view;
}

export function unregisterEditor(view: EditorView): void {
  if (active === view) active = null;
}

export function getActive(): EditorView | null {
  return active;
}

type Insert = { insert: string; anchor: number; head: number };

function buildInsert(cmd: ToolbarCmd, selText: string, from: number, to: number): Insert {
  const sel = selText || '文字';
  const wrap = (pre: string, post = pre): Insert => {
    const insert = pre + sel + post;
    return selText
      ? { insert, anchor: from, head: from + insert.length }
      : { insert, anchor: from + pre.length, head: from + pre.length + sel.length };
  };
  const line = (pre: string): Insert => {
    const insert = pre + sel;
    return selText
      ? { insert, anchor: from, head: from + insert.length }
      : { insert, anchor: from + pre.length, head: from + pre.length + sel.length };
  };

  switch (cmd) {
    case 'bold':
      return wrap('**');
    case 'italic':
      return wrap('*');
    case 'strike':
      return wrap('~~');
    case 'code':
      return wrap('`');
    case 'h1':
      return line('# ');
    case 'h2':
      return line('## ');
    case 'h3':
      return line('### ');
    case 'link': {
      const insert = `[${sel}](https://)`;
      // leave caret just inside the URL parens
      const anchor = from + insert.length - 1;
      return { insert, anchor, head: anchor };
    }
    case 'quote':
      return line('> ');
    case 'ul':
      return line('- ');
    case 'ol':
      return line('1. ');
    case 'task':
      return line('- [ ] ');
    case 'hr': {
      const insert = '\n---\n';
      const anchor = from + insert.length;
      return { insert, anchor, head: anchor };
    }
  }
  return { insert: sel, anchor: from, head: from + sel.length };
}

export function applyMarkdown(cmd: ToolbarCmd): void {
  const view = active;
  if (!view) return;
  const { from, to } = view.state.selection.main;
  const selText = view.state.sliceDoc(from, to);
  const { insert, anchor, head } = buildInsert(cmd, selText, from, to);
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor, head },
    scrollIntoView: true,
  });
  view.focus();
}

export function insertAtCursor(text: string): void {
  const view = active;
  if (!view) return;
  const pos = view.state.selection.main.head;
  const doc = view.state.doc;
  const before = pos > 0 ? doc.sliceString(pos - 1, pos) : '\n';
  const after = pos < doc.length ? doc.sliceString(pos, pos + 1) : '\n';
  const leadBreak = before !== '\n' ? '\n' : '';
  const tailBreak = after !== '\n' ? '\n' : '';
  const insert = leadBreak + text + tailBreak;
  const anchor = pos + insert.length;
  view.dispatch({
    changes: { from: pos, to: pos, insert },
    selection: { anchor, head: anchor },
    scrollIntoView: true,
  });
  view.focus();
}

export function insertAtPos(view: EditorView, pos: number, text: string): void {
  const doc = view.state.doc;
  const before = pos > 0 ? doc.sliceString(pos - 1, pos) : '\n';
  const after = pos < doc.length ? doc.sliceString(pos, pos + 1) : '\n';
  const leadBreak = before !== '\n' ? '\n' : '';
  const tailBreak = after !== '\n' ? '\n' : '';
  const insert = leadBreak + text + tailBreak;
  const anchor = pos + insert.length;
  view.dispatch({
    changes: { from: pos, to: pos, insert },
    selection: { anchor, head: anchor },
    scrollIntoView: true,
  });
  view.focus();
}
