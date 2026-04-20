<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorState, type Extension } from '@codemirror/state';
  import { EditorView } from '@codemirror/view';
  import { tabs } from '$state/tabs.svelte';
  import { files, updateContent } from '$state/files.svelte';
  import {
    registerEditor,
    unregisterEditor,
    insertAtPos,
  } from '$lib/editor-actions';
  import { baseExtensions } from '$lib/cm/extensions';

  let hostEl: HTMLDivElement | null = $state(null);
  let view: EditorView | null = null;
  let currentPath: string | null = null;
  const stateMap = new Map<string, EditorState>();
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
      if (currentPath) stateMap.set(currentPath, view.state);
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

  // Drop closed-tab states so history map doesn't leak.
  $effect(() => {
    const open = new Set(tabs.open);
    for (const p of stateMap.keys()) {
      if (!open.has(p)) stateMap.delete(p);
    }
  });
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
