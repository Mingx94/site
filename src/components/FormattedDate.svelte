<script lang="ts">
  import { format } from "date-fns";

  interface Props {
    date: Date;
  }

  let { date }: Props = $props();
</script>

<time datetime={date.toISOString()}>
  {format(date, "dd MMM, yyyy")}
</time>
