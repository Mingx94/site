<script lang="ts">
  interface Props {
    title: string;
    width?: number;
    height?: number | "auto";
    src: string;
    [key: string]: unknown;
  }

  let { title, width = 500, height = "auto", src, ...rest }: Props = $props();
</script>

<video class="overflow-hidden rounded-lg" {width} {height} controls {...rest}>
  <source src={src.match(/^http/) ? src : `/videos/${src}`} type="video/mp4" />
  {title}
</video>
