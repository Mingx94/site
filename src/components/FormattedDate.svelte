<script lang="ts">
  import { format } from "date-fns";
  import { zhTW } from "date-fns/locale";

  interface Props {
    date: Date;
  }

  let { date }: Props = $props();
</script>

<time datetime={new Date(date).toISOString()}>
  {format(new Date(date), "yyyy 年 M 月 d 日", { locale: zhTW })}
</time>
