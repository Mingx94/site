import type { PortableTextBlock } from "emdash/client";

const CJK_PATTERN =
  /\p{Script=Han}|\p{Script=Hangul}|\p{Script=Hiragana}|\p{Script=Katakana}/gu;

const CJK_CHARS_PER_MINUTE = 500;
const WORDS_PER_MINUTE = 200;

export function getReadingTime(content: PortableTextBlock[]): number {
  const text = content
    .flatMap((block) => block.children ?? [])
    .map((span) => span.text ?? "")
    .join(" ");
  const cjk = text.match(CJK_PATTERN)?.length ?? 0;
  const words = text
    .replace(CJK_PATTERN, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(
    1,
    Math.ceil(words / WORDS_PER_MINUTE + cjk / CJK_CHARS_PER_MINUTE),
  );
}
