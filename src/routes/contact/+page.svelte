<script lang="ts">
  import Container from "@/components/Container.svelte";
  import BackToPrev from "@/components/BackToPrev.svelte";
  import { onMount } from "svelte";

  // Turnstile test key for development — replace via wrangler.jsonc in production
  const SITE_KEY = "0x4AAAAAAC9uFe71dDNfqvcZ";

  let name = $state("");
  let email = $state("");
  let message = $state("");
  let turnstileToken = $state("");
  let status = $state<"idle" | "sending" | "sent" | "error">("idle");
  let errorMsg = $state("");
  let turnstileEl: HTMLDivElement | undefined = $state();

  onMount(() => {
    // Load Turnstile script
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = () => {
      if (turnstileEl && window.turnstile) {
        window.turnstile.render(turnstileEl, {
          sitekey: SITE_KEY,
          callback: (token: string) => {
            turnstileToken = token;
          },
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!turnstileToken) {
      errorMsg = "請完成驗證";
      return;
    }

    status = "sending";
    errorMsg = "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, token: turnstileToken }),
      });

      if (res.ok) {
        status = "sent";
        name = "";
        email = "";
        message = "";
      } else {
        const data = await res.json().catch(() => ({}));
        errorMsg = data.error || "送出失敗，請稍後再試";
        status = "error";
      }
    } catch {
      errorMsg = "網路錯誤，請稍後再試";
      status = "error";
    }
  }
</script>

<svelte:head>
  <title>聯絡 | Vartifact</title>
</svelte:head>

<Container>
  <div class="space-y-6 my-10 max-w-lg mx-auto">
    <div class="animate">
      <BackToPrev />
    </div>

    <h1 class="animate text-2xl font-semibold text-black dark:text-white">
      聯絡我
    </h1>

    {#if status === "sent"}
      <div class="animate rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm">
        感謝你的訊息！我會盡快回覆。
      </div>
    {:else}
      <form onsubmit={handleSubmit} class="animate space-y-4">
        <div class="space-y-1">
          <label for="name" class="text-sm font-medium">名稱</label>
          <input
            id="name"
            type="text"
            bind:value={name}
            required
            maxlength="100"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div class="space-y-1">
          <label for="email" class="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            maxlength="200"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div class="space-y-1">
          <label for="message" class="text-sm font-medium">訊息</label>
          <textarea
            id="message"
            bind:value={message}
            required
            maxlength="2000"
            rows="5"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          ></textarea>
        </div>

        <div bind:this={turnstileEl}></div>

        {#if errorMsg}
          <div class="text-sm text-red-500">{errorMsg}</div>
        {/if}

        <button
          type="submit"
          disabled={status === "sending"}
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "送出中..." : "送出"}
        </button>
      </form>
    {/if}
  </div>
</Container>
