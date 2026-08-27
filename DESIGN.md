---
name: Vartifact
description: A photographic reading room for personal technical writing.
colors:
  proof-paper: "#ebe3d8"
  silver-gelatin: "#1f1e1d"
  paper-card: "#eee8de"
  paper-highlight: "#f8f2e3"
  oxide-red: "#a33f29"
  cream-mark: "#fff9ef"
  warm-grey: "#dfd5c8"
  muted-ink: "#665e56"
  red-wash: "#c97055"
  red-brown-ink: "#442319"
  error-red: "#a9362b"
  hairline: "#9f968c"
  film-black: "#1c1a1a"
  film-caption: "#eee6db"
  darkroom: "#171615"
  dark-card: "#211f1d"
  dark-popover: "#282522"
  dark-oxide: "#df8063"
  dark-muted: "#bcb1a5"
  dark-hairline: "#5f5750"
typography:
  display:
    fontFamily: "Iansui, serif"
    fontSize: "clamp(3rem, 10vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Iansui, serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Iansui, serif"
    fontSize: "clamp(1.4rem, 3vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "Iansui, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.9
  interface:
    fontFamily: "Huninn, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Huninn, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.14em"
  article-headline-mobile:
    fontFamily: "Iansui, serif"
    fontSize: "clamp(2.25rem, 10.75vw, 2.75rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  article-headline-tablet:
    fontFamily: "Iansui, serif"
    fontSize: "clamp(2.25rem, 5vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  article-headline-desktop:
    fontFamily: "Iansui, serif"
    fontSize: "clamp(2.75rem, 4vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  article-introduction:
    fontFamily: "Iansui, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
  article-introduction-wide:
    fontFamily: "Iansui, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.7
  article-section:
    fontFamily: "Iansui, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  article-section-wide:
    fontFamily: "Iansui, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  article-subheading:
    fontFamily: "Iansui, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  article-subheading-wide:
    fontFamily: "Iansui, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  article-quote:
    fontFamily: "Iansui, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.6
  article-quote-wide:
    fontFamily: "Iansui, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.6
  article-metadata:
    fontFamily: "Huninn, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.04em"
  article-micro-label:
    fontFamily: "Huninn, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    letterSpacing: "0.16em"
  article-folio:
    fontFamily: "Huninn, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.2em"
rounded:
  square: "0px"
  tight: "2px"
  frame: "4px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.oxide-red}"
    textColor: "{colors.cream-mark}"
    typography: "{typography.interface}"
    rounded: "{rounded.frame}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.proof-paper}"
    textColor: "{colors.silver-gelatin}"
    typography: "{typography.interface}"
    rounded: "{rounded.frame}"
    padding: "8px 16px"
    height: "36px"
  search-field:
    backgroundColor: "transparent"
    textColor: "{colors.silver-gelatin}"
    typography: "{typography.interface}"
    rounded: "{rounded.square}"
    padding: "16px 16px 16px 28px"
  contact-field:
    backgroundColor: "transparent"
    textColor: "{colors.silver-gelatin}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "8px 0"
  article-row:
    backgroundColor: "transparent"
    textColor: "{colors.silver-gelatin}"
    typography: "{typography.title}"
    rounded: "{rounded.square}"
    padding: "24px 0"
  reaction-chip:
    backgroundColor: "transparent"
    textColor: "{colors.silver-gelatin}"
    typography: "{typography.interface}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
---

# Design System: Vartifact

## Overview

**Creative North Star: "The Contact Sheet Reading Room"**

Vartifact treats each article as a selected photographic frame. The visual world joins a working darkroom with a quiet editorial reading room: warm proof paper supports the page, near-black film holds real cover images, and oxide-red registration marks identify active or selected material.

The system is image-first without competing with the writing. Large serif titles and long-form text provide the authored voice; the sans family handles navigation, metadata, controls, and technical indexing. Flat rules, square frames, and restrained motion keep the site precise rather than nostalgic or ornamental.

**Key Characteristics:**

- Real article photography appears in film-edged frames.
- Warm proof-paper surfaces replace sterile white.
- Oxide red marks selection, links, progress, and action.
- Serif reading voice and sans interface voice are the only two type families.
- Hairline rules, registration marks, and numbered frames provide structure.

## Colors

The light theme resembles warm photographic proof paper; the dark theme becomes a near-black darkroom with softened cream text. Oxide red is the single recurring signal color.

### Primary

- **Oxide Red:** Active navigation, links, selection, reading progress, crop marks, and primary actions.
- **Dark Oxide:** The higher-contrast dark-theme form of the same signal.

### Secondary

- **Red Wash:** Hover fills and secondary accent surfaces.
- **Warm Grey:** Quiet tracks and secondary surfaces in light mode.

### Neutral

- **Proof Paper:** Main light page surface.
- **Silver Gelatin:** Main light-theme text and linework.
- **Paper Card:** Supporting light surface.
- **Paper Highlight:** Popovers and brighter paper details.
- **Muted Ink:** Secondary copy, metadata, and captions.
- **Hairline:** Dividers, form rules, and frame structure.
- **Film Black:** Contact sheets and photographic frame edges.
- **Film Caption:** Text printed against Film Black.
- **Darkroom:** Main dark page surface.
- **Dark Card / Dark Popover:** Dark-theme supporting surfaces.
- **Dark Muted / Dark Hairline:** Dark-theme metadata and rules.

### Tertiary

- **Error Red:** Destructive actions and form errors only.

### Named Rules

**The Oxide Mark Rule.** Oxide red identifies something selected, actionable, or in progress. It is not a large decorative field.

**The Proof and Film Rule.** Reading happens on paper-toned surfaces; photography is held by near-black film. Keep this contrast legible in both themes.

## Typography

**Display Font:** Iansui

**Body Font:** Iansui

**Interface and Label Font:** Huninn

**Character:** Iansui gives titles and articles a handwritten reading voice. Huninn keeps controls, dates, indexes, and metadata friendly and direct. Labels may use tabular numerals and wide tracking, but they remain Huninn rather than introducing a third family.

### Hierarchy

- **Display:** Route mastheads and the largest editorial statements.
- **Headline:** Article titles and selected-feature titles.
- **Title:** Article rows and section headings.
- **Body:** Long-form articles, introductions, descriptions, and personal narrative; article prose stays near 65ch.
- **Interface:** Navigation, buttons, utility links, controls, and compact values.
- **Label:** Uppercase English metadata, dates, frame numbers, counts, and eyebrow text.

### Article Reading Scale

- **Article headline:** Iansui at weight 500, line-height 1.08, and -0.025em tracking. Use 2.25–2.75rem below 48rem, 2.25–2.5rem from 48rem to 64rem, and 2.75–3.75rem from 64rem.
- **Introduction:** Iansui at 1.125rem and line-height 1.7. Increase it to 1.25rem from 48rem.
- **Body:** Iansui at 1rem and line-height 1.9, with a maximum measure of 65ch.
- **Section heading:** Iansui at weight 600 and -0.025em tracking. Use 1.5rem below 48rem and 1.875rem from 48rem.
- **Subheading:** Iansui at weight 600 and -0.025em tracking. Use 1.25rem below 48rem and 1.5rem from 48rem.
- **Pull quote:** Iansui at weight 500 and line-height 1.6. Use 1.25rem below 48rem and 1.5rem from 48rem.
- **Reading utilities:** Use Huninn at 0.875rem for the table of contents and reaction counts, 0.75rem for ledger values, 0.6875rem for index labels, 0.625rem for ledger labels and film captions, and 10px for the colophon.
- **Inline code:** Use Huninn at 0.9em. The mono token aliases Huninn and does not introduce a third family.

### Named Rules

**The Two Families Rule.** Use Iansui for authored reading and Huninn for interface structure. Do not add a display or monospaced family.

**The Caption Discipline Rule.** Widely tracked uppercase labels stay small and brief; they support the reading hierarchy rather than becoming body copy.

**The Reading Toggle Rule.** The reading-font toggle changes article prose, list items, blockquotes, and the introduction to Huninn. Article titles and section headings remain Iansui so the authored hierarchy stays stable.

## Layout

The shared container is fluid up to 92rem with responsive side padding. The homepage opens with a balanced cover-and-copy composition, then exposes a horizontally scrollable contact strip before moving into ruled article lists. Archive and supporting routes use masthead strips, generous title blocks, and long vertical sections rather than dashboard grids.

Article prose narrows to about 65 characters. The main responsive change occurs at 48rem, where type, gaps, and metadata open up. The table of contents becomes a fixed side rail at 96rem; below that it uses a floating control and bottom sheet. Contact-sheet frames scroll horizontally on narrow screens.

**The Selected Frame Rule.** Give one image or article clear priority; supporting frames form a sequence instead of an equal card grid.

**The Reading Measure Rule.** Protect prose measure and vertical rhythm before increasing density or decoration.

## Elevation & Depth

The world is flat by default. Paper texture, film fields, borders, and tonal shifts create most depth. Small contact shadows belong to buttons and active tabs; popovers use a modest floating shadow; the mobile table of contents is the only strong overlay.

### Shadow Vocabulary

- **Contact:** A compact shadow for buttons and selected tab surfaces.
- **Floating:** A low floating shadow for popovers.
- **Overlay:** A stronger shadow for the mobile table-of-contents sheet.
- **Focus:** A three-pixel oxide-tinted ring for keyboard focus.

### Named Rules

**The Flat Proof Rule.** Static reading surfaces do not float. Elevation communicates interaction or overlay hierarchy only.

## Shapes

The core language is square and photographic. Article images and contact sheets have square edges; horizontal rules and frame borders do the structural work. Standard controls use compact four-pixel corners. Two-pixel corners are limited to tight inline treatments. Pills are reserved for reactions and circular icon controls.

Registration crosses, frame numbers, dashed metadata rows, and film captions are signature details. Use them where content behaves like selected material, not as decoration on every section.

## Components

### Buttons

- **Shape:** Compact four-pixel corners and a 36px default minimum height.
- **Primary:** Oxide-red fill with cream text and a small contact shadow.
- **Outline:** Page-toned fill, hairline border, and the same compact geometry.
- **Hover / Focus:** Hover shifts the semantic fill; focus uses the shared oxide ring. Disabled controls lose opacity and interaction.

### Cards / Containers

- **Article Rows:** Flat ruled rows with a serif title, quiet metadata, and an arrow that moves slightly up and right on hover.
- **Film Frames:** Near-black borders, real cover photography, a narrow caption rail, frame numbers, and oxide registration marks.
- **Contact Sheet:** A film-black horizontal strip containing sequential frames; it scrolls on small screens.
- **Shadow Strategy:** Flat at rest.

### Inputs / Fields

- **Search:** A full-width field between horizontal rules with a leading search icon and optional result count.
- **Contact Fields:** Transparent serif inputs with an underline and a small sans label above.
- **Focus / Error:** Focus changes the underline to Oxide Red; errors use Error Red.

### Navigation

The sticky header sits on a lightly blurred page-colored surface. The wordmark is compact and bold. Route links use Huninn; the active route turns oxide red and gains a thin underline. The reading-font toggle shows the Iansui/Huninn choice directly.

### Reaction Chips

Reaction controls are the intentional pill exception. They use a hairline border, compact padding, an emoji, and an optional count; hover and selected states receive a quiet oxide tint.

### Article Content

Long-form content uses Iansui by default, with Huninn available from the reading-font toggle, a 65ch measure, open paragraph leading, numbered ruled sections, a large oxide drop cap, restrained pull quotes, square images, and explicit treatments for code, tables, notices, accordions, and media.

## Do's and Don'ts

### Do:

- **Do** lead with real article cover images and real writing.
- **Do** pair one selected frame with a supporting sequence.
- **Do** use Iansui and Huninn as the complete type system.
- **Do** use hairlines, frame numbers, and registration marks to clarify structure.
- **Do** keep article prose near 65ch and preserve horizontal frame scrolling on mobile.
- **Do** preserve visible focus states, theme parity, and reduced-motion behavior.

### Don't:

- **Don't** add a third font family, including a separate monospaced label font.
- **Don't** round article images or turn the contact sheet into generic soft cards.
- **Don't** use oxide red as a broad background when a small mark communicates selection.
- **Don't** add shadows to static reading sections.
- **Don't** invent photography, claims, or content when real article material exists.
