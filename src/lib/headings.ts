export function headingId(text: string, used: Set<string>): string {
  const base =
    text
      .normalize("NFKC")
      .toLocaleLowerCase("zh-TW")
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "section";
  let id = base;
  for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
  used.add(id);
  return id;
}
