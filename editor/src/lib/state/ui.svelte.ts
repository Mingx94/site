type UiState = {
  cmdOpen: boolean;
  outlineActive: string;
};

export const ui = $state<UiState>({
  cmdOpen: false,
  outlineActive: '',
});

export function openCmd() {
  ui.cmdOpen = true;
}
export function closeCmd() {
  ui.cmdOpen = false;
}
export function toggleCmd() {
  ui.cmdOpen = !ui.cmdOpen;
}
