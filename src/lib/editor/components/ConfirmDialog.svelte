<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { focusTrap } from '$lib/editor/actions/focusTrap';

  type Props = {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
  };
  const {
    title,
    message,
    confirmLabel = '確認',
    cancelLabel = '取消',
    danger = false,
    onConfirm,
    onCancel,
  }: Props = $props();

  let confirmBtn: HTMLButtonElement | null = $state(null);
  let busy = $state(false);

  onMount(async () => {
    await tick();
    confirmBtn?.focus();
  });

  async function doConfirm() {
    busy = true;
    try {
      await onConfirm();
    } finally {
      busy = false;
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && !busy) {
      e.preventDefault();
      onCancel();
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="dlg-overlay" onclick={() => !busy && onCancel()}>
  <div
    class="dlg-box"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="confirm-dialog-title"
    aria-describedby="confirm-dialog-message"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    use:focusTrap
  >
    <h2 class="dlg-title" id="confirm-dialog-title">{title}</h2>
    <p class="dlg-sub" id="confirm-dialog-message">{message}</p>
    <div class="dlg-actions">
      <button
        type="button"
        class="dlg-btn dlg-btn-ghost"
        onclick={onCancel}
        disabled={busy}>{cancelLabel}</button
      >
      <button
        type="button"
        bind:this={confirmBtn}
        class="dlg-btn"
        class:dlg-btn-danger={danger}
        class:dlg-btn-primary={!danger}
        onclick={doConfirm}
        disabled={busy}>{busy ? '處理中…' : confirmLabel}</button
      >
    </div>
  </div>
</div>
