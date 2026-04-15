const CJK_RANGE =
  /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u2e80-\u2eff\u3000-\u303f\uff00-\uffef]/g;
const WORD_RANGE = /[\w-]+/g;

const CJK_CHARS_PER_MINUTE = 500;
const WORDS_PER_MINUTE = 200;

/**
 * Calculate reading time for mixed Chinese/English content.
 * Strips HTML/Markdown syntax before counting.
 */
export function getReadingTime(text: string): number {
  const stripped = text
    .replace(/<[^>]*>/g, "") // HTML tags
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1") // links → text
    .replace(/[#*_~>|-]+/g, "") // markdown syntax
    .trim();

  const cjkChars = stripped.match(CJK_RANGE)?.length ?? 0;
  const withoutCjk = stripped.replace(CJK_RANGE, " ");
  const words = withoutCjk.match(WORD_RANGE)?.length ?? 0;

  const minutes =
    cjkChars / CJK_CHARS_PER_MINUTE + words / WORDS_PER_MINUTE;

  return Math.max(1, Math.ceil(minutes));
}
