<script lang="ts">
  import { format } from "date-fns";

  interface Props {
    date: Date;
  }

  let { date }: Props = $props();
</script>

<time datetime={new Date(date).toISOString()}>
  {format(new Date(date), "dd MMM, yyyy")}
</time>
