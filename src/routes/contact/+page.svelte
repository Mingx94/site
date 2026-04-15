<script lang="ts">
  import Container from "@/components/Container.svelte";
  import BackToPrev from "@/components/BackToPrev.svelte";
  import { staggerIn } from "@/lib/domEvent";
  import { submitContact } from "./contact.remote";
  import type { Attachment } from "svelte/attachments";

  let { data } = $props();

  let sent = $state(false);
  let errorMsg = $state("");

  // Load Turnstile widget via {@attach}
  const loadTurnstile: Attachment = (node) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = () => {
      if (window.turnstile) {
        window.turnstile.render(node as HTMLElement, {
          sitekey: data.turnstileSiteKey,
          "response-field-name": "turnstileToken",
        });
      }
    };
    document.head.appendChild(script);
    return () => script.remove();
  };
</script>

<svelte:head>
  <title>聯絡 | Vartifact</title>
</svelte:head>

<Container>
  <div class="space-y-6 my-10 max-w-lg mx-auto">
    <div {@attach staggerIn} class="animate">
      <BackToPrev />
    </div>

    <h1 {@attach staggerIn} class="animate text-2xl font-semibold text-black dark:text-white">
      聯絡我
    </h1>

    {#if sent}
      <div
        {@attach staggerIn}
        class="animate rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm"
      >
        感謝你的訊息！我會盡快回覆。
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
        {@attach staggerIn}
        class="animate space-y-4"
      >
        <div class="space-y-1">
          <label for="name" class="text-sm font-medium">名稱</label>
          <input
            {...submitContact.fields.name.as("text")}
            id="name"
            required
            maxlength={100}
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div class="space-y-1">
          <label for="email" class="text-sm font-medium">Email</label>
          <input
            {...submitContact.fields.email.as("email")}
            id="email"
            required
            maxlength={200}
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div class="space-y-1">
          <label for="message" class="text-sm font-medium">訊息</label>
          <textarea
            {...submitContact.fields.message.as("text")}
            id="message"
            required
            maxlength={2000}
            rows={5}
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          ></textarea>
        </div>

        <div {@attach loadTurnstile}></div>

        {#if errorMsg}
          <div class="text-sm text-red-500">{errorMsg}</div>
        {/if}

        <button
          type="submit"
          disabled={!!submitContact.pending}
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitContact.pending ? "送出中..." : "送出"}
        </button>
      </form>
    {/if}
  </div>
</Container>
