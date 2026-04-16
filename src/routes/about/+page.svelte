<script lang="ts">
  import BackToPrev from "@/components/BackToPrev.svelte";
  import Container from "@/components/Container.svelte";
  import Social from "@/components/Social.svelte";
  import config from "@/config";
  import { staggerIn } from "@/lib/domEvent";
</script>

<svelte:head>
  <title>關於 | Vartifact</title>
  <meta name="description" content="關於 Michael Tsai — 前端工程師，Vartifact 部落格的作者。" />
</svelte:head>

<Container>
  <div class="my-10 max-w-prose mx-auto space-y-10">
    <div {@attach staggerIn} class="animate">
      <BackToPrev />
    </div>

    <article {@attach staggerIn} class="animate content">
      <h1>關於我</h1>

      <p>
        我是 Michael Tsai，前端工程師，目前在台灣工作。
        工作上主要使用 React 與 Next.js 開發 Web 應用，對效能優化、無障礙設計與使用者體驗有持續的關注。
      </p>

      <p>
        這個部落格（Vartifact）是用 SvelteKit 打造的，算是邊探索邊實作的產物。
        平時也會研究新的前端技術，然後把有趣的發現或心得記錄在這裡。
      </p>

      <h2>工作以外</h2>

      <p>
        出門一定帶相機。部落格裡用到的圖片幾乎都是自己拍的，
        拍攝的時候也是一種思考方式——構圖和寫程式有點像，都在尋找最精簡卻最有力量的表達。
      </p>

      <h2>聯絡</h2>

      <p>
        有任何想法、合作機會或只是想打個招呼，歡迎透過以下方式找到我，
        或直接使用 <a href="/contact">聯絡頁面</a> 發訊息。
      </p>
    </article>

    <div {@attach staggerIn} class="animate">
      <Social
        source={config.social}
        className={{
          list: "flex flex-wrap gap-2",
          item: "flex",
          icon: "size-5",
        }}
      />
    </div>
  </div>
</Container>
