// UI state for inline create/rename inputs in the file tree.

type Creating = {
  parentDir: string; // workspace-relative; '' for root
  kind: 'file' | 'dir';
};

type EditsState = {
  // When set, the row at this path is in rename mode.
  renaming: string | null;
  // When set, an inline input should appear inside `parentDir` for a new
  // file/dir.
  creating: Creating | null;
  // Generic transient error from an in-flight CRUD action.
  error: string | null;
};

export const edits = $state<EditsState>({
  renaming: null,
  creating: null,
  error: null,
});

export function startRename(path: string) {
  edits.creating = null;
  edits.error = null;
  edits.renaming = path;
}

export function startCreate(parentDir: string, kind: 'file' | 'dir') {
  edits.renaming = null;
  edits.error = null;
  edits.creating = { parentDir, kind };
}

export function cancelEdit() {
  edits.renaming = null;
  edits.creating = null;
  edits.error = null;
}

export function setEditError(msg: string | null) {
  edits.error = msg;
}
