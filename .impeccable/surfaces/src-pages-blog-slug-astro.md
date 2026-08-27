---
version: 1
slug: "src-pages-blog-slug-astro"
primary_target: "src/pages/blog/[slug].astro"
related_targets: ["src/layouts/BlogPost.astro", "src/components/PostCover.astro", "src/components/TableOfContents.astro", "src/styles/global.css", "src/styles/tokens.css"]
---

# Reading Ledger

Approved comp: `.impeccable/mocks/decision/article-reading-ledger.png`

## Composition

Use a desktop editorial ledger. Put a narrow article index at the left. Put the title and description in the center. Put a compact film-edged cover and a ruled metadata table at the right. Start the article text in the first viewport.

Keep the article body near 65 characters per line. Keep the table of contents secondary to the text. The desktop index can stay visible while the article scrolls. The title, cover, and metadata must scroll with the article and must not stay fixed in the viewport. On small screens, remove the ledger geometry. Stack the title, cover, metadata, and article body in reading order. Keep a compact table-of-contents control instead of the desktop margin index.

Use only real article content, dates, author data, cover images, and existing interactions. Preserve reading progress, views, theme controls, font controls, Markdown content, and accessible labels.

## Grammar

- Components: flat regions, ruled metadata rows, square film frames, sparse crop marks, and one narrow index rail.
- Corners: square or nearly square. Do not use card radii.
- Lines: use 1 px semantic hairlines only where they separate metadata, mark the index position, or close the article lead. Do not add a top rule to the article lead or index. Use a 10-14 px film edge around the cover.
- Elevation: flat. Use no decorative shadows on article structure.
- Type: use Iansui for the article title and prose. Use Huninn for navigation, labels, metadata, and the index. Do not add a third family.
- Measure: keep prose at approximately 65 characters per line with a generous line height.

## Color

| Role | Value |
| --- | --- |
| Paper ground | `#ebe3d8` |
| Film edge | `#1c1a1a` |
| Warm black | `#1f1e1d` |
| Oxide red | `#a33f29` |
| Quiet rule | `var(--border)`; `#9f968c` in light mode and `#5f5750` in dark mode |

## Visible inventory

| Ingredient | Medium | Commitment |
| --- | --- | --- |
| Article index | Semantic HTML and existing heading data | Narrow desktop rail with an active oxide marker |
| Article title and description | Semantic HTML | Primary authored block with restrained display size |
| Cover image | Existing media through `PostCover` | Compact landscape frame with film edge and useful alt text |
| Author and article facts | Semantic HTML | Ruled metadata table with tabular values |
| Article body | Existing Markdown output | Starts in the first viewport and keeps the existing behavior |
| Reading progress and controls | Existing scripts and components | Preserve function, focus, labels, and reduced-motion behavior |

## Motion

Keep the article content visible by default. Use only existing restrained transitions. Do not animate reading, scrolling, or direct controls.
