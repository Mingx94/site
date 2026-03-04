<script lang="ts">
  import RiBlueskyLine from "~icons/ri/bluesky-line";
  import RiCodepenLine from "~icons/ri/codepen-line";
  import RiFacebookCircleLine from "~icons/ri/facebook-circle-line";
  import RiGithubLine from "~icons/ri/github-line";
  import RiInstagramLine from "~icons/ri/instagram-line";
  import RiLinkedinLine from "~icons/ri/linkedin-line";
  import RiMailLine from "~icons/ri/mail-line";
  import RiMastodonLine from "~icons/ri/mastodon-line";
  import RiRedditLine from "~icons/ri/reddit-line";
  import RiThreadsLine from "~icons/ri/threads-line";
  import RiTwitterLine from "~icons/ri/twitter-line";
  import RiYoutubeLine from "~icons/ri/youtube-line";
  import Link from "./Link.svelte";

  interface Props {
    source: Record<string, string>;
    className?: {
      list?: string;
      item?: string;
      icon?: string;
    };
  }

  let { source, className }: Props = $props();

  const renderMap = {
    bluesky: { Icon: RiBlueskyLine, ariaLabel: "bluesky" },
    facebook: { Icon: RiFacebookCircleLine, ariaLabel: "facebook" },
    twitter: { Icon: RiTwitterLine, ariaLabel: "twitter" },
    mastodon: { Icon: RiMastodonLine, ariaLabel: "mastodon" },
    instagram: { Icon: RiInstagramLine, ariaLabel: "instagram" },
    threads: { Icon: RiThreadsLine, ariaLabel: "threads" },
    reddit: { Icon: RiRedditLine, ariaLabel: "reddit" },
    youtube: { Icon: RiYoutubeLine, ariaLabel: "youtube" },
    linkedin: { Icon: RiLinkedinLine, ariaLabel: "linkedin" },
    codepen: { Icon: RiCodepenLine, ariaLabel: "codepen" },
    github: { Icon: RiGithubLine, ariaLabel: "github" },
    email: { Icon: RiMailLine, ariaLabel: "email" },
  };

  type KeyOfRenderMap = keyof typeof renderMap;
  const order: KeyOfRenderMap[] = ["github", "linkedin", "bluesky", "twitter"];
  const orderMap = new Map<KeyOfRenderMap, number>(
    order.map((key, index) => [key, index]),
  );
  const sorted = Object.entries(renderMap).toSorted((a, b) => {
    const aIndex = orderMap.get(a[0] as KeyOfRenderMap) ?? Infinity;
    const bIndex = orderMap.get(b[0] as KeyOfRenderMap) ?? Infinity;
    return aIndex - bIndex;
  });
</script>

<ul class={className?.list}>
  {#each sorted as [key, value]}
    {#if source[key]}
      <li class={className?.item}>
        <Link
          aria-label={value.ariaLabel}
          href={source[key]}
          external={true}
          underline={false}
        >
          <value.Icon class={className?.icon} />
        </Link>
      </li>
    {/if}
  {/each}
</ul>
