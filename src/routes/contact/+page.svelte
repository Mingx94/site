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

    const render = () => {
      if (!window.turnstile) return;
      widgetId = window.turnstile.render(node as HTMLElement, {
        sitekey: data.turnstileSiteKey,
        "response-field-name": "turnstileToken",
      });
    };

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
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // Already removed by Turnstile internals.
        }
      }
    };
  };
</script>

<Seo
  title="聯絡 | Vartifact"
  description="合作、提問、或打個招呼——請留下訊息。"
/>

<Container>
  <div class="pt-4 md:pt-8 pb-8 space-y-12 md:space-y-16">
    <!-- Masthead strip -->
    <div
      {@attach staggerIn}
      class="animate flex items-baseline justify-between gap-4 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
    >
      <span>· Correspondence · Contact</span>
      <span>N°03</span>
    </div>

    <!-- Title block -->
    <div class="space-y-6 -mt-6 md:-mt-10">
      <h1
        {@attach staggerIn}
        class="animate font-bold leading-[0.95] tracking-tighter text-foreground"
        style="font-size: clamp(3rem, 10vw, 6rem);"
      >
        聯絡<span class="text-primary">.</span>
      </h1>

      <p
        {@attach staggerIn}
        class="animate max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground"
      >
        合作、提問、或單純想打個招呼——<br class="hidden md:inline" />
        請留下訊息，我會回覆。
      </p>
    </div>

    <!-- Form or success -->
    <section {@attach staggerIn} class="animate">
      {#if sent}
        <div
          class="border-y border-primary/40 py-10 text-center space-y-3"
        >
          <p
            class="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
          >
            · Message Sent
          </p>
          <p class="text-xl md:text-2xl text-foreground">
            感謝你的訊息<span class="text-primary">.</span>
          </p>
          <p class="text-muted-foreground">我會盡快回覆。</p>
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
          class="max-w-xl space-y-6"
        >
          <div class="space-y-2 border-t border-border pt-4">
            <label
              for="name"
              class="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              · Name · 名稱
            </label>
            <input
              {...submitContact.fields.name.as("text")}
              id="name"
              required
              autocomplete="name"
              maxlength={100}
              class="w-full border-b border-border bg-transparent py-2 text-lg text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-primary focus:outline-none"
            />
          </div>

          <div class="space-y-2 border-t border-border pt-4">
            <label
              for="email"
              class="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              · Email
            </label>
            <input
              {...submitContact.fields.email.as("email")}
              id="email"
              required
              autocomplete="email"
              maxlength={200}
              class="w-full border-b border-border bg-transparent py-2 text-lg text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-primary focus:outline-none"
            />
          </div>

          <div class="space-y-2 border-t border-border pt-4">
            <label
              for="message"
              class="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              · Message · 訊息
            </label>
            <textarea
              {...submitContact.fields.message.as("text")}
              id="message"
              required
              maxlength={2000}
              rows={6}
              class="w-full border-b border-border bg-transparent py-2 text-base text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-primary focus:outline-none resize-y"
            ></textarea>
          </div>

          <div {@attach loadTurnstile} class="pt-2"></div>

          {#if errorMsg}
            <div
              class="font-mono text-[11px] uppercase tracking-[0.2em] text-destructive"
            >
              · Error · {errorMsg}
            </div>
          {/if}

          <div class="flex items-center justify-between border-t border-border pt-4">
            <span
              class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              · Ready to send
            </span>
            <Button type="submit" disabled={!!submitContact.pending}>
              {submitContact.pending ? "送出中..." : "送出 →"}
            </Button>
          </div>
        </form>
      {/if}
    </section>
  </div>

  <div {@attach staggerIn} class="animate mt-8 flex">
    <BackToPrev />
  </div>
</Container>
