# Approved Redesign Asset Manifest

Approved mock: `.impeccable/mocks/decision/model-pick.png`
Product source: `PRODUCT.md`
Output directory: `static/design/`

## Produce

### proof-paper

- `id`: `proof-paper`
- `source_crop`: Approved mock page ground: the warm, lightly fibrous photographic proof-paper field behind all homepage regions.
- `output_path`: `static/design/proof-paper.png`
- `strategy`: Faithful clean texture generation, resized to the required production dimensions, palette-compressed, then edge-blended so opposite edges match exactly. The image contains no interface chrome; CSS owns color overlays, opacity, repeat behavior, and dark-theme treatment. The exact generation prompt is embedded in the PNG under `impeccable:prompt`.
- `prompt_used`:

```text
Use case: stylized-concept
Asset type: seamless website background texture, final production asset
Primary request: create a perfectly tileable 2048 by 2048 pixel warm photographic proof-paper grain background
Scene/backdrop: an even flat field of warm ivory photographic proof paper
Subject: only extremely subtle fine analog paper fibers and restrained photographic darkroom grain distributed uniformly edge to edge
Style/medium: high-resolution macro photographic surface texture, understated archival proof-sheet paper, natural and tactile
Composition/framing: orthographic flat-on view, fully seamless on all four edges, no focal point, no directional lighting, uniform density
Lighting/mood: diffuse neutral illumination, quiet editorial warmth
Color palette: warm ivory, pale cream, tiny sparse beige and soft gray grain; very low contrast
Materials/textures: fine uncoated paper tooth with subtle analog photographic grain, not distressed
Constraints: exact 2048x2048 square PNG; seamless tile; no UI; no text; no typography; no borders; no shadows; no objects; no marks; no claims; no logos; no watermark; no vignette; no stains; no folds; no scratches; no torn edges; no repeated visible pattern; texture must remain subtle behind black body text
```

- `dimensions`: `2048x2048 px`
- `format`: `PNG`, indexed palette, approximately 1.0 MB
- `transparency`: `none`; opaque warm paper base
- `deviations`: The native generator returned 1254x1254. It was resampled to the required 2048x2048 and given a 160 px smooth opposite-edge blend. No visible material, color, or density change from the approved role. Exact edge test: left/right mean absolute pixel difference `0`; top/bottom `0`.
- `qa_status`: `accepted` — visually inspected after resize, palette compression, seam correction, and prompt embedding; remains subtle, uniform, text-free, and free of baked interface elements.

## Direct

### why-astro-cover

- `id`: `why-astro-cover`
- `source_crop`: Approved mock dominant selected-frame photograph and its first contact-sheet thumbnail, mapped to the real published article cover required by product truth.
- `output_path`: `src/content/posts/why-astro/cover.jpg` (use the existing file directly; do not copy, regenerate, or replace it)
- `strategy`: Existing project photography. Render through semantic `<picture>`/`<img>` markup and responsive CSS cropping. Reuse this same source for the lead selected frame and its contact-sheet thumbnail.
- `prompt_used`: `not applicable — pre-existing project photograph`
- `dimensions`: `4032x3024 px`
- `format`: `JPEG`
- `transparency`: `none`
- `deviations`: The real cover shows a bright blue-sky canal scene rather than the mock's invented concrete-architecture photo. This is intentional: real article content outranks comp placeholder imagery.
- `qa_status`: `accepted` — source opened and inspected at full project resolution; no baked UI, card chrome, or letterboxing.

## Semantic

### page-shell

- `id`: `page-shell`
- `implementation`: Use a semantic page wrapper with the warm base color plus `url('/design/proof-paper.png') repeat`; apply any restraint/contrast layer with CSS custom properties. Keep a centered max-width reading canvas, fluid gutters, and responsive vertical rhythm. Use a dark-theme CSS color layer and low-opacity/background-blend treatment rather than generating a second texture.
- `notes`: The texture is material only. It must not determine spacing, layout, or text contrast.
- `qa_status`: `accepted`

### site-navigation

- `id`: `site-navigation`
- `implementation`: Build a semantic `<header>` and `<nav>` with a text link for `Vartifact` and real links for `Writing`, `About`, and `Contact`. Use CSS for the thin bottom rule, wide desktop distribution, compact mobile wrapping/menu behavior, focus-visible states, and oxide-red crop-register marks via pseudo-elements or inline SVG.
- `notes`: No raster wordmark, nav labels, rules, or marks. Preserve actual routes and keyboard navigation.
- `qa_status`: `accepted`

### lead-story-composition

- `id`: `lead-story-composition`
- `implementation`: Use `<article>` with a dominant `<figure>` containing the direct `why-astro` cover and a sibling semantic text panel. Desktop uses an asymmetric grid with the photograph larger than the copy; mobile stacks image before copy. CSS owns the near-black proof-frame, square corners, image clipping, aspect ratio, frame number, selected-frame caption, thin borders, and responsive `object-fit`/`object-position`. Crop/register marks should be CSS pseudo-elements or a small authored inline SVG.
- `notes`: The image remains the only dominant focal element. Do not bake crop marks, labels, borders, or captions into it.
- `qa_status`: `accepted`

### feature-copy-and-metadata

- `id`: `feature-copy-and-metadata`
- `implementation`: Render the real article heading and author as HTML, with the title in the chosen serif family and navigation/metadata in the sans family. Use a semantic definition list for factual metadata sourced from the post frontmatter. CSS owns the oxide-red eyebrow/rule, dotted separators, uppercase tracking, and type ramp.
- `notes`: Do not invent the mock's `35mm`, camera, lens, project, notes, or frame-count claims unless real content provides them.
- `qa_status`: `accepted`

### contact-sheet-index

- `id`: `contact-sheet-index`
- `implementation`: Build a horizontally scrollable `<ol>` of article links. Each item uses its real cover when present, a numeric frame label, and real metadata. CSS owns the black film field, square thumbnail slots, active oxide-red outline, tick-mark ruler pattern, selection marker, and overflow affordance. With one current post, render one truthful selected frame rather than duplicating photographs to imitate six entries.
- `notes`: The strip expands naturally as real posts are added. Use scroll snapping and visible keyboard focus; never rasterize the whole strip.
- `qa_status`: `accepted`

### recent-writing

- `id`: `recent-writing`
- `implementation`: Build the second-fold section from semantic heading and article-list markup. Reuse real post data and direct cover assets. CSS owns the full-width rule, editorial grid, square corners, spacing, and hover/focus states.
- `notes`: Keep the fold hint from the approved topology, but do not manufacture extra articles to fill the viewport.
- `qa_status`: `accepted`

### typography-and-theme

- `id`: `typography-and-theme`
- `implementation`: Define exactly two font-family stacks/tokens: one clean sans family for navigation, labels, metadata, and controls; one literary serif family for article titles and reading content. Use responsive `clamp()` sizes, controlled line lengths, CSS color tokens, and accessible light/dark contrast. Avoid raster text everywhere.
- `notes`: Typography, hierarchy, and theme remain implementation responsibilities; the texture should be reduced or blended when necessary for dark-mode legibility.
- `qa_status`: `accepted`

## Execution Order

1. `proof-paper` — completed before implementation; builder reads its embedded prompt before composing it.
2. `why-astro-cover` — reference the existing project file directly; do not mutate it.
3. `page-shell` and `typography-and-theme` — establish material, tokens, and reading hierarchy.
4. `site-navigation` — establish the global frame and responsive chrome.
5. `lead-story-composition` and `feature-copy-and-metadata` — compose the first-view focal region around the real cover.
6. `contact-sheet-index` — implement the one-post truthful state and content-driven expansion.
7. `recent-writing` — continue the system below the first viewport.

## Blockers

None. The approved mock, the real article cover, image generation, output path, and semantic implementation boundaries were available.

## Assumptions

- `src/content/posts/why-astro/cover.jpg` is the canonical real cover and remains unchanged.
- The current repository contains one published post and one cover; the contact sheet therefore starts with one truthful frame.
- The builder will use `/design/proof-paper.png` as a repeated material layer and may tune its opacity/blend in CSS for legibility and dark mode.
- All mock camera/lens/roll labels are visual placeholders, not product facts; implementation uses only real post metadata.
- Film frames, crop marks, labels, rules, typography, navigation, interactive states, and responsive behavior remain semantic HTML/CSS/SVG.
