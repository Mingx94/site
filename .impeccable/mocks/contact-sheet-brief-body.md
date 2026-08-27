# Contact Sheet Reading Room

Approved comp: `.impeccable/mocks/decision/model-pick.png`

## Composition

Use layout A. A slim masthead sits above a balanced first viewport: a large selected article image on the left and the article title, author, and compact metadata on the right. A horizontal contact strip follows, then the recent-writing index. On mobile, stack the selected image before its title and keep the contact strip horizontally scrollable.

Do not literalize invented comp details. Render only real articles, real dates, real cover images, real links, and existing features. With one article, show one real frame rather than fake entries.

## Grammar

- Components: square photographic frames, thin crop marks, hairline rules, numbered contact-strip entries, flat controls.
- Corners: nearly square; 0-2px for frames and inputs, 4px only for compact controls.
- Lines: 1px warm-black or oxide-red; black film borders are 10-14px.
- Elevation: structurally flat; soft low offset only for popovers and focus.
- Type: Noto Sans TC for navigation, metadata, controls; Noto Serif TC for titles and reading copy. No third family.
- Ramp: display `clamp(3rem, 7vw, 5.75rem)`, page title `clamp(2.5rem, 6vw, 5rem)`, section title `clamp(2rem, 4vw, 3rem)`, body `1rem-1.125rem` at `1.8`.

## Sampled colors

| Role | Value |
| --- | --- |
| Paper ground | `#ebe3d8` |
| Light paper variation | `#f8f2e3` |
| Film strip | `#1c1a1a` |
| Warm black | `#1f1e1d` |
| Oxide red | `#c97055` |

## Visible inventory

| Ingredient | Medium | Commitment |
| --- | --- | --- |
| Paper ground and grain | Generated raster plus CSS color | Full page, subtle, never lowers contrast |
| Vartifact masthead and navigation | Semantic HTML/CSS | Thin bottom rule, compact sans labels |
| Selected article image | Existing project raster | Large 3:2 image with black film edge and oxide crop marks |
| Feature title and author | Semantic HTML/CSS | Serif title, no baked text |
| Frame metadata | Semantic HTML/CSS | Real index, date, reading time; sans tabular numerals |
| Contact strip | Semantic HTML/CSS plus existing covers | Real posts only; horizontal scroll on small screens |
| Recent writing index | Semantic HTML/CSS plus existing covers | Strong row hierarchy, no equal-size card grid |
| Search, theme, font, contact form | Existing interactive components restyled | Preserve behavior and accessible states |
| Crop and registration marks | CSS pseudo-elements | Sparse oxide-red marks; no decorative overload |

## Motion

The selected image develops once on initial load using a short clip-path reveal. Other content is visible by default and uses restrained transitions. Respect reduced motion.
