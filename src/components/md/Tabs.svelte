<script lang="ts">
  import * as Tabs from "@/components/ui/tabs";

  interface Props {
    tabs: string[];
    children: any;
  }
  const { tabs, children }: Props = $props();

  let tabList = $state<{ name: string; children: HTMLDivElement | null }[]>([]);

  function attachTemplate(node: HTMLDivElement) {
    const template = node.cloneNode(true) as HTMLDivElement;
    tabList = tabs.map((tab) => ({
      name: tab,
      children: template.querySelector(`[data-name="${tab}"]`),
    }));
  }
</script>

<Tabs.Root value={tabs[0]}>
  <Tabs.List>
    {#each tabs as tab}
      <Tabs.Trigger value={tab}>{tab}</Tabs.Trigger>
    {/each}
  </Tabs.List>
  <!-- Template for tabs -->
  <div class="sr-only" {@attach attachTemplate}>
    {@render children()}
  </div>

  {#each tabList as tab}
    <Tabs.Content value={tab.name} class={tab.children?.className}>
      {@html tab.children?.innerHTML}
    </Tabs.Content>
  {/each}
</Tabs.Root>
