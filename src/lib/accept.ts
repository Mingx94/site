export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  let markdown = 0;
  let html = 0;
  for (const part of accept.split(",")) {
    const [type, ...parameters] = part
      .trim()
      .split(";")
      .map((value) => value.trim());
    const q = parameters.find((parameter) => parameter.startsWith("q="));
    const quality = q ? Number.parseFloat(q.slice(2)) || 0 : 1;
    if (type === "text/markdown") markdown = Math.max(markdown, quality);
    else if (["text/html", "text/*", "*/*"].includes(type))
      html = Math.max(html, quality);
  }
  return markdown > 0 && markdown > html;
}
