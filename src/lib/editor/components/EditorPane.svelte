<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorState, type Extension } from '@codemirror/state';
  import { EditorView } from '@codemirror/view';
  import { tabs } from '$lib/editor/state/tabs.svelte';
  import { files, updateContent } from '$lib/editor/state/files.svelte';
  import {
    registerEditor,
    unregisterEditor,
    insertAtPos,
  } from '$lib/editor/editor-actions';
  import { baseExtensions } from '$lib/editor/cm/extensions';

  let hostEl: HTMLDivElement | null = $state(null);
  let view: EditorView | null = null;
  let currentPath: string | null = null;
  // LRU cache of CodeMirror states keyed by file path. Kept after a tab
  // is closed so "close tab → reopen → Ctrl-Z" still steps through the
  // author's undo history. Oldest entry is evicted when we go over cap.
  const STATE_CAP = 16;
  const stateMap = new Map<string, EditorState>();
  function rememberState(path: string, state: EditorState): void {
    // Delete-then-set makes `path` the most-recently-inserted key, which
    // JS Map iteration order treats as most-recently-used.
    stateMap.delete(path);
    stateMap.set(path, state);
    while (stateMap.size > STATE_CAP) {
      const oldest = stateMap.keys().next().value;
      if (oldest === undefined) break;
      stateMap.delete(oldest);
    }
  }
  let dragOver = $state(false);

  let extensions: Extension[] = [];

  function freshState(doc: string): EditorState {
    return EditorState.create({ doc, extensions });
  }

  onMount(() => {
    if (!hostEl) return;

    extensions = baseExtensions({
      onDocChange: (doc) => {
        if (!currentPath) return;
        const f = files.byPath[currentPath];
        if (!f) return;
        if (f.content !== doc) updateContent(currentPath, doc);
      },
      onDrop: (e, v) => {
        e.preventDefault();
        dragOver = false;
        const snippet = e.dataTransfer?.getData('text/plain');
        if (!snippet) return;
        const pos =
          v.posAtCoords({ x: e.clientX, y: e.clientY }) ??
          v.state.selection.main.head;
        insertAtPos(v, pos, snippet);
      },
    });

    view = new EditorView({
      state: EditorState.create({ doc: '', extensions }),
      parent: hostEl,
    });
    registerEditor(view);

    return () => {
      if (view) {
        unregisterEditor(view);
        view.destroy();
        view = null;
      }
    };
  });

  // Tab switch + external content sync.
  $effect(() => {
    const path = tabs.active;
    if (!view || !path) return;
    const f = files.byPath[path];
    if (!f) return;

    if (path !== currentPath) {
      if (currentPath) rememberState(currentPath, view.state);
      const next = stateMap.get(path) ?? freshState(f.content);
      view.setState(next);
      currentPath = path;
    } else {
      const doc = view.state.doc.toString();
      if (doc !== f.content) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: f.content },
        });
      }
    }
  });

  // Intentionally *don't* drop closed-tab states here — the LRU cap in
  // `rememberState` bounds memory growth, and keeping the state lets a
  // user close a tab by mistake, reopen it, and still press Ctrl-Z.
</script>

<section
  class="pane pane-editor"
  class:drag-over={dragOver}
  aria-label="編輯器"
  ondragover={(e) => {
    e.preventDefault();
    dragOver = true;
  }}
  ondragleave={() => (dragOver = false)}
  ondrop={() => (dragOver = false)}
>
  <div class="ed-host" bind:this={hostEl}></div>
</section>
