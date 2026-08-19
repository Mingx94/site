---
name: Vartifact
description: A warm personal technical journal built for clear, calm reading.
colors:
  evergreen-ink: "oklch(0.5234 0.1347 144.1672)"
  evergreen-bright: "oklch(0.6731 0.1624 144.2083)"
  soft-parchment: "oklch(0.9711 0.0074 80.7211)"
  charcoal-moss: "oklch(0.2683 0.0279 150.7681)"
  moss-surface: "oklch(0.3327 0.0271 146.9867)"
  brown-ink: "oklch(0.3 0.0358 30.2042)"
  cream-ink: "oklch(0.9423 0.0097 72.6595)"
  soft-sepia: "oklch(0.4495 0.0486 39.211)"
  sage-wash: "oklch(0.8952 0.0504 146.0366)"
  hairline-clay: "oklch(0.8805 0.0208 74.6428)"
  moss-border: "oklch(0.3942 0.0265 142.9926)"
  signal-red: "oklch(0.5386 0.1937 26.7249)"
typography:
  display:
    fontFamily: "Schibsted Grotesk, Huninn, sans-serif"
    fontSize: "clamp(3.25rem, 13vw, 8.5rem)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Schibsted Grotesk, Huninn, sans-serif"
    fontSize: "clamp(3rem, 10vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.05em"
  title:
    fontFamily: "Schibsted Grotesk, Huninn, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Schibsted Grotesk, Iansui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.9
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.2em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.evergreen-ink}"
    textColor: "{colors.soft-parchment}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.soft-parchment}"
    textColor: "{colors.brown-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  input-text:
    backgroundColor: "transparent"
    textColor: "{colors.brown-ink}"
    typography: "{typography.body}"
    rounded: "0px"
    padding: "8px 0"
  article-card:
    backgroundColor: "{colors.soft-parchment}"
    textColor: "{colors.brown-ink}"
    rounded: "{rounded.lg}"
    padding: "12px 48px 12px 16px"
---

# Design System: Vartifact

## Overview

**Creative North Star: "The Quiet Technical Journal"**

Vartifact feels like a carefully kept personal journal for the web. It combines the clarity of technical documentation with the warmth of paper, personal notes, and authored observations. The design is calm and editorial, but it should never feel cold or corporate.

The system uses large confident titles, long comfortable reading rhythm, quiet hairline dividers, and small monospaced labels. Green is used as ink: a focused signal for active states, punctuation, links, and meaningful actions. Soft shadows give buttons, cards, and floating controls a friendly tactile response without turning the site into a layered application dashboard.

**Key Characteristics:**

- Warm paper-like surfaces with dark natural ink.
- Large editorial titles paired with small technical labels.
- Generous reading space inside a compact 64rem page frame.
- Hairline structure, gentle corners, and restrained soft depth.
- Calm motion that supports reading and respects reduced-motion settings.

## Colors

The palette pairs warm neutral paper with natural green ink and a deep moss night theme.

### Primary

- **Evergreen Ink** (oklch(0.5234 0.1347 144.1672)): The main action and emphasis color. Use it for active navigation, links, title punctuation, progress, selected controls, and primary buttons.
- **Evergreen Bright** (oklch(0.6731 0.1624 144.2083)): The dark-theme form of the main accent, tuned to stay visible against Charcoal Moss.

### Neutral

- **Soft Parchment** (oklch(0.9711 0.0074 80.7211)): The light page and surface color.
- **Charcoal Moss** (oklch(0.2683 0.0279 150.7681)): The dark page background.
- **Moss Surface** (oklch(0.3327 0.0271 146.9867)): The dark-theme card, popover, and muted surface.
- **Brown Ink** (oklch(0.3 0.0358 30.2042)): The main light-theme text color.
- **Cream Ink** (oklch(0.9423 0.0097 72.6595)): The main dark-theme text color.
- **Soft Sepia** (oklch(0.4495 0.0486 39.211)): Secondary light-theme text and metadata.
- **Sage Wash** (oklch(0.8952 0.0504 146.0366)): Hover fills, selected backgrounds, and quiet emphasis.
- **Hairline Clay** (oklch(0.8805 0.0208 74.6428)): Light-theme borders and dividers.
- **Moss Border** (oklch(0.3942 0.0265 142.9926)): Dark-theme borders and dividers.
- **Signal Red** (oklch(0.5386 0.1937 26.7249)): Errors, destructive actions, and draft warnings only.

### Named Rules

**The Green Ink Rule.** Evergreen Ink is a focused signal, not a large decorative field. Keep it rare enough that active states and links remain meaningful.

**The Paper and Moss Rule.** Light mode feels like Soft Parchment; dark mode feels like Charcoal Moss. Do not replace either theme with pure white or pure black.

## Typography

**Display Font:** Schibsted Grotesk with Huninn fallback

**Body Font:** Schibsted Grotesk with switchable Iansui or Huninn Chinese support

**Label/Mono Font:** JetBrains Mono

**Character:** The pairing is warm and personal at reading sizes, confident at display sizes, and precise in metadata. The font toggle is part of the product: Chinese readers can choose the texture they prefer.

### Hierarchy

- **Display** (700, fluid 3.25rem–8.5rem, 0.88): Home masthead only; tight, large, and unmistakable.
- **Headline** (700, fluid 3rem–6rem, 0.95): Route titles such as Articles, About, and Contact.
- **Title** (600, 1.25rem–1.5rem, 1.375): Article list titles, cards, and subsection titles.
- **Body** (400, 1rem–1.25rem, up to 1.9): Reading copy, limited to about 65ch for articles and 42rem for introductions.
- **Label** (400, 10px–11px, 0.2em, uppercase): Navigation indexes, dates, section eyebrows, counts, and form labels.

### Named Rules

**The Two Voices Rule.** Use the sans family for human reading and JetBrains Mono for structure, metadata, indexes, and system labels.

**The Tight Title Rule.** Large headings use close tracking and compact line height; body copy restores open rhythm for reading.

## Layout

The main frame is centered, no wider than 64rem, with 1.25rem side padding. The fixed header shares this frame and the main content begins below it with 6rem of top space. Article prose narrows to about 65 characters per line.

Pages use strong vertical sections rather than card grids. Hairline rules start sections, while repeated spacing steps of 8px, 16px, 24px, 32px, and 64px create the rhythm. Article and social lists use a number, a flexible text column, and a small directional icon.

The main responsive change happens at 48rem: titles and copy grow, gaps open, metadata can move into rows, and desktop-only labels appear. Small layout changes begin at 40rem. The article table of contents becomes a fixed side rail only at 96rem; below that it uses a floating button and bottom sheet.

**The Reading First Rule.** Responsive changes protect line length and reading rhythm before they add decoration or density.

## Elevation & Depth

The system is structurally flat, but interactive and floating elements use soft low-contrast shadows. Buttons and active tabs use a small contact shadow. Popovers use a modest floating shadow. The mobile table of contents uses the strongest depth because it must sit clearly above the article.

### Shadow Vocabulary

- **Contact** (`0 1px 2px color-mix(in oklch, var(--foreground) 8%, transparent)`): Primary and outline buttons, active tabs, and optionally interactive cards.
- **Floating** (`0 4px 6px color-mix(in oklch, var(--foreground) 12%, transparent)`): Popovers.
- **Overlay** (`0 25px 50px -12px rgb(0 0 0 / 0.25)`): The mobile table-of-contents sheet.
- **Focus** (`0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)`): Keyboard focus.

**The Soft Depth Rule.** Shadows show touch, focus, or floating hierarchy. They do not decorate static page sections.

## Shapes

Corners are gently rounded, not pill-shaped by default. The shared scale runs from 4px to 12px, with 6px controls, 8px cards and media, and 12px only for larger soft containers. Hairline borders do most of the structural work.

Pills are reserved for reactions and circular icon controls. Article images use 6px–8px clipping. Inputs remain flat and underline-based, which keeps forms connected to the editorial layout.

## Components

### Buttons

Friendly and tactile, but still compact.

- **Shape:** Gently curved controls (6px) with a 36px default minimum height.
- **Primary:** Evergreen Ink background, light text, 8px × 16px padding, and a soft contact shadow.
- **Hover / Focus:** Hover deepens the current fill. Keyboard focus adds a 3px Evergreen ring. Disabled controls use 50% opacity.
- **Outline / Ghost:** Paper or translucent moss surfaces with hairline borders; hover changes to Sage Wash.
- **Destructive:** Signal Red is reserved for destructive actions and error-related controls.

### Cards / Containers

Cards feel like notes resting on the page, not dashboard widgets.

- **Corner Style:** Gentle 8px corners.
- **Background:** The current page or card surface.
- **Shadow Strategy:** Flat at rest or the Contact shadow for an interactive card.
- **Border:** One-pixel Hairline Clay or Moss Border.
- **Internal Padding:** Usually 12px vertically and 16px horizontally, with extra space for directional icons.

### Inputs / Fields

- **Style:** Transparent fields with a bottom hairline, no enclosing box, and 8px vertical padding.
- **Focus:** The underline changes to Evergreen Ink.
- **Error / Disabled:** Signal Red labels errors; disabled actions lose opacity and interaction.

### Navigation

The header is fixed over a softly blurred page-colored surface. Links use compact sans text; route indexes use tiny JetBrains Mono labels on wider screens. Muted text is the default, Brown or Cream Ink appears on hover, and Evergreen Ink plus a one-pixel underline marks the active route.

### Tabs

Tabs sit in a Sage Wash or muted track with 8px outer corners and 6px triggers. The active tab returns to the page surface with a soft contact shadow. Focus uses the shared Evergreen ring.

### Article Lists

Rows are divided by hairlines and use a three-part structure: monospaced number, article copy, and an arrow. Hover changes the title and arrow to Evergreen Ink while the arrow moves slightly up and right.

### Article Content

Long-form content uses a 65ch reading column, 1.9 paragraph line height, numbered section headings, a large first-letter drop cap, restrained pull quotes, rounded images, and explicit styles for code, tables, notices, accordions, and media.

## Do's and Don'ts

### Do:

- **Do** put article titles and reading content first.
- **Do** use Soft Parchment, Charcoal Moss, and natural ink colors instead of sterile white and black.
- **Do** use JetBrains Mono for small structural labels and metadata.
- **Do** use one-pixel dividers and generous vertical rhythm to organize pages.
- **Do** keep hover motion small, purposeful, and between 150ms and 300ms.
- **Do** preserve visible focus states and reduced-motion behavior.

### Don't:

- **Don't** make the site look like a corporate dashboard with dense panels, charts, or application chrome.
- **Don't** use neon colors, glowing cyber effects, or loud technology gradients.
- **Don't** turn every section into a card.
- **Don't** use large green backgrounds when a small green signal is enough.
- **Don't** replace the warm editorial rhythm with cramped utility layouts.
