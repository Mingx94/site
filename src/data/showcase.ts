export interface ShowcaseItem {
  name: string;
  href: string;
  stack: string;
  badge?: string;
  desc: string;
}
// Add your own projects here. Sienna hides the navigation and home section when empty.
export const showcase: ShowcaseItem[] = [];
