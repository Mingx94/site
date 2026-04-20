// Svelte action that keeps keyboard focus inside a modal container while
// it's mounted, and restores focus to whatever element had it before the
// modal opened. Apply to the dialog's outer element:
//
//   <div class="dlg-box" use:focusTrap role="dialog">...</div>
//
// Behaviour:
//   - On mount: remember document.activeElement and focus the first
//     focusable element inside the node (or the node itself as fallback).
//   - While mounted: Tab / Shift-Tab cycle within the node.
//   - On teardown: restore focus to the remembered element.
//
// Only covers Tab-cycling; Esc handling and click-outside-to-close are
// the component's responsibility.

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

function getFocusable(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      // offsetParent being null = display:none or detached; we want visible.
      (el.offsetParent !== null || el === document.activeElement),
  );
}

export function focusTrap(node: HTMLElement) {
  const previouslyFocused = document.activeElement as HTMLElement | null;

  // Queue initial focus after mount so child inputs with autofocus still win.
  queueMicrotask(() => {
    if (node.contains(document.activeElement)) return;
    const focusables = getFocusable(node);
    (focusables[0] ?? node).focus();
  });

  function onKeydown(ev: KeyboardEvent) {
    if (ev.key !== 'Tab') return;
    const focusables = getFocusable(node);
    if (focusables.length === 0) {
      ev.preventDefault();
      node.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (ev.shiftKey) {
      if (active === first || !node.contains(active)) {
        ev.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        ev.preventDefault();
        first.focus();
      }
    }
  }

  node.addEventListener('keydown', onKeydown);

  return {
    destroy() {
      node.removeEventListener('keydown', onKeydown);
      // Restore focus to whatever opened the dialog so keyboard users land
      // back on the button / list row they came from.
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try {
          previouslyFocused.focus();
        } catch {
          /* node may be detached — fine */
        }
      }
    },
  };
}
