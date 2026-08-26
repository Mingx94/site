<script lang="ts">
  import BackToPrev from "@/components/BackToPrev.svelte";
  import Container from "@/components/Container.svelte";
  import { Button } from "@/components/ui/button";
  import { staggerIn } from "@/lib/domEvent";
  import { tick } from "svelte";
  import type { Attachment } from "svelte/attachments";

  let { data } = $props();

  let sent = $state(false);
  let pending = $state(false);
  let errorMsg = $state("");
  let turnstileStatus = $state<"loading" | "ready" | "error">("loading");
  let feedbackElement = $state<HTMLDivElement>();

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    errorMsg = "";
    pending = true;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: new FormData(event.currentTarget as HTMLFormElement),
      });
      if (!response.ok) throw new Error();
      sent = true;
    } catch {
      errorMsg = "送出失敗，請再試一次。";
    } finally {
      pending = false;
      await tick();
      feedbackElement?.focus();
    }
  }

  // The Turnstile script is idempotent and cached once loaded, so we
  // reuse it across SPA remounts. The widget, on the other hand, holds
  // its own DOM + iframe inside the host container; if we don't call
  // `turnstile.remove(widgetId)` on unmount, navigating back to /contact
  // stacks a fresh widget next to the stale one.
  const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  const loadTurnstile: Attachment = (node) => {
    let widgetId: string | undefined;
    let widgetSize: "flexible" | "compact" | undefined;
    let scriptElement: HTMLScriptElement | undefined;
    let resizeFrame: number | undefined;
    let disposed = false;

    const showTurnstileError = () => {
      if (!disposed) turnstileStatus = "error";
    };

    const removeWidget = () => {
      if (!widgetId || !window.turnstile) return;
      try {
        window.turnstile.remove(widgetId);
      } catch {
        // Already removed by Turnstile internals.
      }
      widgetId = undefined;
    };

    const render = () => {
      if (disposed || !window.turnstile) return;
      const nextSize =
        node.getBoundingClientRect().width < 300 ? "compact" : "flexible";
      if (widgetId && widgetSize === nextSize) return;

      removeWidget();
      turnstileStatus = "loading";
      widgetSize = nextSize;
      try {
        widgetId = window.turnstile.render(node as HTMLElement, {
          sitekey: data.turnstileSiteKey,
          size: nextSize,
          "response-field-name": "turnstileToken",
          callback: () => {
            if (!disposed) turnstileStatus = "ready";
          },
          "error-callback": showTurnstileError,
          "expired-callback": () => {
            if (!disposed) turnstileStatus = "loading";
          },
        });
      } catch {
        showTurnstileError();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(render);
    });
    resizeObserver.observe(node);

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src^="${TURNSTILE_SRC}"]`,
      );
      if (existing) {
        scriptElement = existing;
      } else {
        scriptElement = document.createElement("script");
        scriptElement.src = TURNSTILE_SRC;
        scriptElement.async = true;
      }
      scriptElement.addEventListener("load", render, { once: true });
      scriptElement.addEventListener("error", showTurnstileError, {
        once: true,
      });
      if (!existing) document.head.appendChild(scriptElement);
    }

    return () => {
      disposed = true;
      scriptElement?.removeEventListener("load", render);
      scriptElement?.removeEventListener("error", showTurnstileError);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      removeWidget();
    };
  };
</script>

<Container>
  <div class="contact">
    <!-- Masthead strip -->
    <div {@attach staggerIn} class="animate strip">
      <span>· Correspondence · Contact</span>
      <span>N°03</span>
    </div>

    <!-- Title block -->
    <div class="title-block">
      <h1 {@attach staggerIn} class="animate page-title">
        聯絡<span class="accent">.</span>
      </h1>

      <p {@attach staggerIn} class="animate introduction">
        合作、提問、或單純想打個招呼——<br class="desktop-break" />
        請留下訊息，我會回覆。
      </p>
    </div>

    <!-- Form or success -->
    <section {@attach staggerIn} class="animate">
      {#if sent}
        <div
          class="success"
          role="status"
          tabindex="-1"
          bind:this={feedbackElement}
        >
          <p class="success-label">· Message Sent</p>
          <p class="success-title">
            感謝你的訊息<span class="accent">.</span>
          </p>
          <p class="muted">我會盡快回覆。</p>
        </div>
      {:else}
        <form
          onsubmit={submit}
          class="form"
          aria-busy={pending ? "true" : "false"}
        >
          <div class="field">
            <label for="name" class="label"> · Name · 名稱 </label>
            <input
              name="name"
              id="name"
              required
              autocomplete="name"
              maxlength={100}
              class="input"
            />
          </div>

          <div class="field">
            <label for="email" class="label"> · Email </label>
            <input
              name="email"
              id="email"
              required
              autocomplete="email"
              maxlength={200}
              class="input"
            />
          </div>

          <div class="field">
            <label for="message" class="label"> · Message · 訊息 </label>
            <textarea
              name="message"
              id="message"
              required
              maxlength={2000}
              rows={6}
              class="input message"></textarea>
          </div>

          <div {@attach loadTurnstile} class="turnstile"></div>

          <p
            id="turnstile-status"
            class:verification-error={turnstileStatus === "error"}
            class="verification-status"
            aria-live="polite"
          >
            {#if turnstileStatus === "loading"}
              正在準備安全驗證…
            {:else if turnstileStatus === "ready"}
              安全驗證完成，可以送出。
            {:else}
              安全驗證暫時無法使用，請重新整理頁面後再試。
            {/if}
          </p>

          {#if errorMsg}
            <div
              class="error"
              role="alert"
              tabindex="-1"
              bind:this={feedbackElement}
            >
              · Error · {errorMsg}
            </div>
          {/if}

          <div class="submit-row">
            <span class="label"> · Ready to send </span>
            <Button
              type="submit"
              disabled={pending || turnstileStatus !== "ready"}
              aria-describedby="turnstile-status"
            >
              {#if pending}
                送出中…
              {:else if turnstileStatus === "loading"}
                等待驗證
              {:else if turnstileStatus === "error"}
                無法送出
              {:else}
                送出 →
              {/if}
            </Button>
          </div>
        </form>
      {/if}
    </section>
  </div>

  <div {@attach staggerIn} class="animate back-link">
    <BackToPrev />
  </div>
</Container>

<style>
  .contact {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    padding-block: 1rem 2rem;
  }
  .strip,
  .submit-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .strip {
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    color: var(--muted-foreground);
    font: 11px var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .title-block {
    margin-top: -1.5rem;
  }
  .title-block > * + * {
    margin-top: 1.5rem;
  }
  .page-title {
    color: var(--foreground);
    font-size: clamp(3rem, 10vw, 6rem);
    font-family: var(--font-serif);
    font-weight: 500;
    letter-spacing: -0.035em;
    line-height: 0.95;
  }
  .accent {
    color: var(--primary);
  }
  .introduction {
    max-width: 42rem;
    color: var(--muted-foreground);
    font-size: 1.125rem;
    line-height: 1.625;
    font-family: var(--font-serif);
  }
  .desktop-break {
    display: none;
  }
  .success {
    padding-block: 2.5rem;
    border-block: 1px solid color-mix(in oklch, var(--primary) 40%, transparent);
    text-align: center;
  }
  .success:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 0.5rem;
  }
  .success > * + * {
    margin-top: 0.75rem;
  }
  .success-label,
  .label,
  .error {
    font-family: var(--font-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .success-label {
    color: var(--primary);
    font-size: 11px;
  }
  .success-title {
    color: var(--foreground);
    font-size: 1.25rem;
  }
  .muted {
    color: var(--muted-foreground);
  }
  .form {
    max-width: 36rem;
  }
  .form > * + * {
    margin-top: 1.5rem;
  }
  .field {
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }
  .field > * + * {
    margin-top: 0.5rem;
  }
  .label {
    display: block;
    color: var(--muted-foreground);
    font-size: 10px;
  }
  .input {
    width: 100%;
    min-height: 2.75rem;
    padding-block: 0.5rem;
    color: var(--foreground);
    border: 0;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    font-size: 1.125rem;
    font-family: var(--font-serif);
    transition: border-color 200ms;
    appearance: none;
  }
  .input::placeholder {
    color: color-mix(in oklch, var(--muted-foreground) 40%, transparent);
  }
  .input:focus {
    border-bottom-color: var(--primary);
  }
  .input:focus-visible {
    border-bottom-width: 2px;
    outline: none;
  }
  .message {
    font-size: 1rem;
    resize: vertical;
  }
  .turnstile {
    padding-top: 0.5rem;
  }
  .verification-status {
    min-height: 1.25rem;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    line-height: 1.5;
  }
  .verification-error {
    color: var(--destructive);
  }
  .error {
    color: var(--destructive);
    font-size: 11px;
    overflow-wrap: anywhere;
  }
  .error:focus-visible {
    outline: 2px solid var(--destructive);
    outline-offset: 0.5rem;
  }
  .submit-row {
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }
  .back-link {
    display: flex;
    margin-top: 2rem;
  }
  @media (width >= 48rem) {
    .contact {
      gap: 4rem;
      padding-top: 2rem;
    }
    .title-block {
      margin-top: -2.5rem;
    }
    .introduction {
      font-size: 1.25rem;
    }
    .desktop-break {
      display: inline;
    }
    .success-title {
      font-size: 1.5rem;
    }
  }
  @media (width >= 64rem) {
    .contact {
      display: grid;
      grid-template-areas:
        "strip strip"
        "title form";
      grid-template-columns: minmax(16rem, 0.8fr) minmax(28rem, 1fr);
      column-gap: clamp(4rem, 8vw, 9rem);
      row-gap: 4rem;
    }
    .strip {
      grid-area: strip;
    }
    .title-block {
      grid-area: title;
      min-width: 0;
      margin-top: 0;
    }
    .contact > section {
      grid-area: form;
      min-width: 0;
    }
    .form {
      width: 100%;
      max-width: 40rem;
    }
  }
</style>
