<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    className?: string;
    children: Snippet;
  }

  let { title, className = "", children }: Props = $props();
  let show = $state(false);

  function toggleShow() {
    show = !show;
  }
</script>

<div class="accordion {show ? 'active' : ''} {className}">
  <button class="accordion-header" onclick={toggleShow}>
    {title}
    <svg
      class="accordion-icon"
      x="0px"
      y="0px"
      viewBox="0 0 512 512"
      xml:space="preserve"
    >
      <path
        fill="currentColor"
        d="M505.755,123.592c-8.341-8.341-21.824-8.341-30.165,0L256.005,343.176L36.421,123.592c-8.341-8.341-21.824-8.341-30.165,0 s-8.341,21.824,0,30.165l234.667,234.667c4.16,4.16,9.621,6.251,15.083,6.251c5.462,0,10.923-2.091,15.083-6.251l234.667-234.667 C514.096,145.416,514.096,131.933,505.755,123.592z"
      ></path>
    </svg>
  </button>
  <div class="accordion-content">
    {@render children()}
  </div>
</div>
