<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { focusTrap } from '$lib/editor/actions/focusTrap';

  type Props = {
    title: string;
    message: string;
    defaultValue?: string;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Sync validator. Return null when the value is acceptable, otherwise
     *  return an error message that the dialog will surface inline. */
    validate?: (value: string) => string | null;
    onConfirm: (value: string) => void | Promise<void>;
    onCancel: () => void;
  };

  const {
    title,
    message,
    defaultValue = '',
    placeholder,
    confirmLabel = '確認',
    cancelLabel = '取消',
    validate,
    onConfirm,
    onCancel,
  }: Props = $props();

  // `value` is seeded from the prop on mount and then owned by the dialog.
  // The local `let` (no $state) intentionally captures the initial value;
  // we re-assign through `value = …` afterwards.
  let value = $state('');
  let error = $state<string | null>(null);
  let busy = $state(false);
  let inputEl: HTMLInputElement | null = $state(null);

  // Initialise from the prop without tying the runtime value to it (props
  // could re-render but the dialog is short-lived per open).
  $effect(() => {
    if (value === '' && defaultValue) value = defaultValue;
  });

  // Live validation as the user types — clears the error on input but only
  // blocks confirm when validate() returns a message at submit time.
  const liveError = $derived(validate ? validate(value) : null);
  const submitDisabled = $derived(busy || !value.trim() || !!liveError);

  onMount(async () => {
    await tick();
    if (!inputEl) return;
    inputEl.focus();
    // Pre-select the editable portion (everything before the first dot)
    // so the user can replace the placeholder by typing.
    const dot = value.lastIndexOf('.');
    if (dot > 0) inputEl.setSelectionRange(0, dot);
    else inputEl.select();
  });

  async function doConfirm() {
    const v = value.trim();
    if (!v) return;
    if (validate) {
      const err = validate(v);
      if (err) {
        error = err;
        return;
      }
    }
    busy = true;
    error = null;
    try {
      await onConfirm(v);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }

  function onKey(e: KeyboardEvent) {
    if (busy) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      doConfirm();
    } else if (e.key === 'Escape') {
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
    role="dialog"
    aria-modal="true"
    aria-labelledby="prompt-dialog-title"
    aria-describedby="prompt-dialog-message"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    use:focusTrap
  >
    <h2 class="dlg-title" id="prompt-dialog-title">{title}</h2>
    <p class="dlg-sub" id="prompt-dialog-message">{message}</p>
    <input
      bind:this={inputEl}
      bind:value
      class="prompt-input"
      class:has-error={!!liveError}
      type="text"
      spellcheck="false"
      autocomplete="off"
      {placeholder}
    />
    {#if liveError && value}
      <div class="prompt-hint">{liveError}</div>
    {:else if error}
      <div class="prompt-hint">{error}</div>
    {/if}
    <div class="dlg-actions">
      <button
        type="button"
        class="dlg-btn dlg-btn-ghost"
        onclick={onCancel}
        disabled={busy}>{cancelLabel}</button
      >
      <button
        type="button"
        class="dlg-btn dlg-btn-primary"
        onclick={doConfirm}
        disabled={submitDisabled}>{busy ? '處理中…' : confirmLabel}</button
      >
    </div>
  </div>
</div>

<style>
  .prompt-input {
    width: 100%;
    margin: 0 0 8px;
    padding: 8px 12px;
    background: var(--paper-card);
    border: 1px solid var(--line-hard);
    border-radius: 4px;
    font-family: var(--mono);
    font-size: 14px;
    color: var(--ink);
    outline: 0;
  }
  .prompt-input:focus {
    border-color: var(--accent);
  }
  .prompt-input.has-error {
    border-color: var(--accent);
  }
  .prompt-hint {
    margin: 0 0 14px;
    color: var(--accent);
    font-family: var(--mono);
    font-size: 11px;
  }
</style>
