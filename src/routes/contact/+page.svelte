<script lang="ts">
  import BackToPrev from "@/components/BackToPrev.svelte";
  import Container from "@/components/Container.svelte";
  import Seo from "@/components/Seo.svelte";
  import { Button } from "@/components/ui/button";
  import { staggerIn } from "@/lib/domEvent";
  import { submitContact } from "./contact.remote";
  import type { Attachment } from "svelte/attachments";

  let { data } = $props();

  let sent = $state(false);
  let errorMsg = $state("");

  // The Turnstile script is idempotent and cached once loaded, so we
  // reuse it across SPA remounts. The widget, on the other hand, holds
  // its own DOM + iframe inside the host container; if we don't call
  // `turnstile.remove(widgetId)` on unmount, navigating back to /contact
  // stacks a fresh widget next to the stale one.
  const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  const loadTurnstile: Attachment = (node) => {
    let widgetId: string | undefined;
    let widgetSize: "flexible" | "compact" | undefined;
    let disposed = false;

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
      widgetSize = nextSize;
      widgetId = window.turnstile.render(node as HTMLElement, {
        sitekey: data.turnstileSiteKey,
        size: nextSize,
        "response-field-name": "turnstileToken",
      });
    };

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(node);

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src^="${TURNSTILE_SRC}"]`,
      );
      if (existing) {
        existing.addEventListener("load", render, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = TURNSTILE_SRC;
        script.async = true;
        script.addEventListener("load", render, { once: true });
        document.head.appendChild(script);
      }
    }

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      removeWidget();
    };
  };
</script>

<Seo
  title="聯絡 | Vartifact"
  description="合作、提問、或打個招呼——請留下訊息。"
/>

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
        <div class="success">
          <p class="success-label">· Message Sent</p>
          <p class="success-title">
            感謝你的訊息<span class="accent">.</span>
          </p>
          <p class="muted">我會盡快回覆。</p>
        </div>
      {:else}
        <form
          {...submitContact.enhance(async ({ submit }) => {
            errorMsg = "";
            try {
              if (await submit()) {
                sent = true;
              } else {
                errorMsg = "送出失敗，請再試一次。";
              }
            } catch {
              errorMsg = "送出失敗，請再試一次。";
            }
          })}
          class="form"
        >
          <div class="field">
            <label for="name" class="label"> · Name · 名稱 </label>
            <input
              {...submitContact.fields.name.as("text")}
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
              {...submitContact.fields.email.as("email")}
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
              {...submitContact.fields.message.as("text")}
              id="message"
              required
              maxlength={2000}
              rows={6}
              class="input message"></textarea>
          </div>

          <div {@attach loadTurnstile} class="turnstile"></div>

          {#if errorMsg}
            <div class="error">
              · Error · {errorMsg}
            </div>
          {/if}

          <div class="submit-row">
            <span class="label"> · Ready to send </span>
            <Button type="submit" disabled={!!submitContact.pending}>
              {submitContact.pending ? "送出中..." : "送出 →"}
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
    border-bottom: 1px solid var(--border);
    background: transparent;
    font-size: 1.125rem;
    font-family: var(--font-serif);
    transition: border-color 200ms;
  }
  .input::placeholder {
    color: color-mix(in oklch, var(--muted-foreground) 40%, transparent);
  }
  .input:focus {
    border-color: var(--primary);
    outline: none;
  }
  .message {
    font-size: 1rem;
    resize: vertical;
  }
  .turnstile {
    padding-top: 0.5rem;
  }
  .error {
    color: var(--destructive);
    font-size: 11px;
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
