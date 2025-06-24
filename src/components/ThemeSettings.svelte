<script lang="ts">
  import { onMount } from "svelte";
  import RiPaletteLine from "~icons/ri/palette-line";
  import FontSelect from "./FontSelect.svelte";
  import { Button } from "./ui/button";
  import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

  const themeList = [
    {
      name: "淺色",
      value: "light",
      icon: `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-colors duration-300 ease-in-out group-hover:stroke-black group-hover:dark:stroke-white"
      >
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`,
    },
    {
      name: "深色",
      value: "dark",
      icon: `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-colors duration-300 ease-in-out group-hover:stroke-black group-hover:dark:stroke-white"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`,
    },
    {
      name: "系統",
      value: "system",
      icon: `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-colors duration-300 ease-in-out group-hover:stroke-black group-hover:dark:stroke-white"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>`,
    },
  ] as const;

  function toggleTheme(dark: boolean) {
    const css = document.createElement("style");

    css.appendChild(
      document.createTextNode(
        `* {
           -webkit-transition: none !important;
           -moz-transition: none !important;
           -o-transition: none !important;
           -ms-transition: none !important;
           transition: none !important;
        }
      `,
      ),
    );

    document.head.appendChild(css);

    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    window.getComputedStyle(css).opacity;
    document.head.removeChild(css);
  }

  function onSelectTheme(theme: "light" | "dark" | "system") {
    if (theme === "system") {
      toggleTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
      localStorage.removeItem("theme");
    } else {
      toggleTheme(theme === "dark");
      localStorage.setItem("theme", theme);
    }
  }

  onMount(() => {
    const handleThemeChange = () => {
      if (!localStorage.getItem("theme")) {
        toggleTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", handleThemeChange);

    return () => {
      media.removeEventListener("change", handleThemeChange);
    };
  });
</script>

<Popover>
  <PopoverTrigger>
    <Button variant="outline" aria-label="主題設定" title="主題設定">
      <RiPaletteLine class="size-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent align="end" class="w-60">
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-4">
        <p class="text-sm">主題</p>
        <div class="flex items-center gap-1">
          {#each themeList as theme (theme.value)}
            <Button
              variant="outline"
              onclick={() => onSelectTheme(theme.value)}
            >
              {@html theme.icon}
            </Button>
          {/each}
        </div>
      </div>
      <div class="flex items-center gap-4">
        <p class="text-sm">字體</p>
        <FontSelect />
      </div>
    </div>
  </PopoverContent>
</Popover>
