import { slugify } from './util';

export type Heading = { level: number; text: string; slug: string };

export function extractOutline(body: string): Heading[] {
  const out: Heading[] = [];
  const re = /^(#{1,4})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out.push({ level: m[1].length, text: m[2].trim(), slug: slugify(m[2]) });
  }
  return out;
}
