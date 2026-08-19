# Native CSS Migration Plan

## Decision

Replace Tailwind CSS with Svelte scoped CSS and native CSS.

Do not replace Tailwind with another utility framework. Keep CSS close to each Svelte component. Keep only site-wide tokens, reset rules, document rules, and article rules in global CSS.

Use an incremental migration. Keep every phase buildable. Remove the Tailwind path from each component in the same change that adds its native CSS.

## Goals

- Remove Tailwind CSS and its related build tools.
- Preserve the current design, responsive layout, dark theme, motion, and accessibility.
- Use Svelte scoped styles for component-owned CSS.
- Use native CSS custom properties for design tokens.
- Keep global selectors small and explicit.
- Keep Bits UI as the behavior layer for the current UI components.
- Make future style changes clear without a utility-class reference.

## Non-goals

- Do not redesign the site.
- Do not change routes, content, or application behavior.
- Do not add a CSS-in-JS library, CSS Modules, Sass, or another utility engine.
- Do not create a local copy of Tailwind utilities.
- Do not keep compatibility classes after the migration.

## Current baseline

The current source has:

- 38 Svelte files.
- 37 Svelte or CSS files with styling.
- Approximately 255 lines with `class=`.
- 57 lines with `@apply`.
- One Svelte `<style>` block.
- One production CSS asset of 86,862 bytes, or 12.98 kB compressed.

Tailwind also owns these concerns:

- The CSS reset through Preflight.
- Colors, fonts, radii, tracking, and breakpoints.
- The article defaults through `@tailwindcss/typography`.
- Popover motion through `tw-animate-css`.
- Component variants through `tailwind-variants`.
- Class conflict handling through `tailwind-merge`.
- Class sorting through `prettier-plugin-tailwindcss`.

Record reference screenshots before the first style change. Use light and dark themes at 390 px, 768 px, 1280 px, and 1536 px. Capture these routes:

- `/`
- `/blog`
- One full article page
- `/about`
- `/contact`
- The error page

Also capture the theme popover, tabs, accordion, mobile table of contents, validation errors, focus rings, and reduced-motion behavior.

## Target CSS structure

Use this structure after the migration:

```text
src/styles/
├── global.css       # Imports and site shell rules
├── tokens.css       # Custom properties for themes and shared values
└── reset.css        # Small native reset

src/content/styles/
└── article.css      # Global rules for rendered article content

src/**/*.svelte      # Scoped component styles
```

Do not add a shared component stylesheet. A component owns its markup, states, media rules, and animation rules.

### `tokens.css`

Move the current `:root` and `.dark` custom properties into this file. Keep semantic names such as `--background`, `--foreground`, `--primary`, and `--border`.

Add only tokens that have multiple consumers. These can include:

- Font families.
- Radius values.
- Common transition durations and easing values.
- Shared page width and reading width.
- Repeated focus-ring values.

Do not make a token for each CSS value. Local component values stay local.

CSS custom properties cannot supply native media-query conditions. Use the current breakpoint values directly where a viewport query is necessary:

- 40 rem
- 48 rem
- 64 rem
- 80 rem
- 96 rem

Prefer container queries for reusable components when the component width is the real condition. Do not convert every viewport query to a container query during this migration.

### `reset.css`

Replace only the Preflight behavior that the site needs. Cover these items:

- `box-sizing` inheritance.
- Default margin removal.
- Form-control font inheritance.
- Responsive media defaults.
- Button and input normalization used by this site.
- List and heading defaults that the components or article stylesheet expect.

Compare the reset against the reference screenshots. Do not copy all Tailwind Preflight rules.

### `global.css`

Make this file the small site entry point. It imports tokens, reset rules, and article rules. It also owns:

- The page background and text color.
- The document font.
- The header, main, and footer shell.
- The skip link.
- Selection colors.
- The shared page-entry animation.
- Reduced-motion overrides.

Replace every `@apply`, `@theme`, `@plugin`, `@custom-variant`, and `@variant` rule with standard CSS.

### Scoped component styles

Add one `<style>` block to each component that needs CSS. Use short semantic class names such as `.card`, `.title`, `.meta`, and `.icon`.

Use these conversions:

| Tailwind pattern      | Native CSS pattern                        |
| --------------------- | ----------------------------------------- |
| Responsive prefix     | `@media (width >= ...)`                   |
| `dark:` prefix        | `:global(.dark) .element`                 |
| `group-hover:`        | `.group:hover .child` with semantic names |
| `data-[state=...]`    | `[data-state="..."]`                      |
| Arbitrary selector    | A direct nested selector                  |
| Arbitrary value       | A normal CSS declaration                  |
| Color with opacity    | `color-mix()` or a semantic token         |
| Repeated utility list | One component class                       |

Use native CSS nesting only when it makes ownership clear. Keep selector depth small.

### Public component APIs

Do not use Tailwind strings as a component API.

- Replace `tailwind-variants` with typed props and fixed semantic classes or `data-variant` attributes.
- Replace consumer-supplied layout classes with explicit props when the component must support that option.
- Keep a forwarded `class` only for a root element when it has a clear use.
- Do not depend on a parent scoped style to reach inside a child component.
- Keep `clsx` only if it still makes conditional class composition simpler.
- Remove `cn()` if it has no users after `tailwind-merge` is removed.

Review `Social.svelte`, `Accordion.svelte`, Button, Tabs, and Popover first because they accept class values or compose classes.

### Article CSS

Keep article CSS global because it styles rendered mdsvex content. Replace the Typography plugin with explicit `.content` rules for:

- Headings and heading rhythm.
- Paragraphs and the first drop cap.
- Links and focus states.
- Ordered and unordered lists.
- Blockquotes.
- Inline code and code blocks.
- Tables.
- Images, figures, and captions.
- Horizontal rules.
- Custom article components.
- Light and dark themes.

Use `:where()` for low-specificity article defaults. Keep custom component rules more specific than the defaults. Test one article that contains all supported content elements.

## Migration phases

### Phase 0: Freeze the baseline

1. Run `npm run check`, `npm run test`, and `npm run build` in an environment that permits Wrangler writes.
2. Save the CSS size and build time.
3. Capture the reference screenshots and interaction states.
4. List all current Tailwind-related dependencies and source directives.

Exit condition: The baseline is reproducible and any existing failure is recorded.

### Phase 1: Remove Tailwind from global rules

1. Convert all `@apply` rules in `src/styles/global.css` to native declarations.
2. Keep the Tailwind import and theme bridge during this phase so unmigrated components still work.
3. Preserve the current page shell, theme, selection, focus, and motion behavior.
4. Add reduced-motion coverage where it is missing.

Exit condition: Global rules contain no `@apply`, and all existing utility classes still work.

### Phase 2: Migrate UI primitives

Migrate these components first:

1. Button.
2. Tabs.
3. Popover.

Replace `tailwind-variants` with typed variants. Replace `tw-animate-css` popover classes with component keyframes and state selectors. Preserve Bits UI attributes, focus handling, keyboard behavior, and collision-aware transform origin.

Exit condition: The UI primitive directory has no Tailwind class strings. Its public API does not accept Tailwind variants.

### Phase 3: Migrate shared site components

Migrate one component at a time. Start with small leaf components, then migrate components with more states.

Suggested order:

1. FormattedDate, Logo, Link, Container, and Social.
2. BackToTop, BackToPrev, ArrowCard, and Footer.
3. FontToggle, ThemeSettings, Header, and TableOfContents.
4. ReactionBar and Seo-related visible elements.

Rename `TwSizeIndicator.svelte` to a framework-neutral name if the indicator is still useful. Remove it if it is obsolete.

Exit condition: Shared site components have no Tailwind class strings and pass visual and interaction checks.

### Phase 4: Migrate routes

Migrate complete routes so each review has a clear visual boundary:

1. Error page.
2. Home page.
3. About page.
4. Blog index.
5. Contact page.
6. Blog article shell.

Move repeated route patterns into a component only when at least two routes need the same structure and behavior. Do not create global utility classes for repeated markup.

Exit condition: Route files have no Tailwind class strings. All target widths match the reference layout.

### Phase 5: Migrate article content

1. Write explicit native article defaults.
2. Migrate Figure, Cover, Video, Button, Accordion, Notice, Tabs, and Tab.
3. Test long headings, nested lists, wide code, wide tables, images, and custom components.
4. Test article colors and syntax highlighting in both themes.

Exit condition: `article.css` has no Tailwind directives and does not need the Typography plugin.

### Phase 6: Remove the Tailwind toolchain

1. Replace `@theme` with normal custom properties in `tokens.css`.
2. Add the native reset and remove the Tailwind import.
3. Remove `@tailwindcss/vite` from `vite.config.ts`.
4. Remove these packages when no source file uses them:
   - `tailwindcss`
   - `@tailwindcss/vite`
   - `@tailwindcss/typography`
   - `prettier-plugin-tailwindcss`
   - `tailwind-merge`
   - `tailwind-variants`
   - `tw-animate-css`
5. Update `package-lock.json`.
6. Delete `components.json` if the shadcn generator is no longer part of the workflow.
7. Update the stack and development notes in `README.md`.
8. Delete obsolete Tailwind-named files and comments.

Exit condition: The project builds without a Tailwind package or Tailwind source directive.

## Checks for every phase

Run these checks after each phase:

```powershell
npm run check
npm run test
npm run build
git diff --check
```

Also complete these checks for changed UI:

- Compare light and dark screenshots.
- Check all target widths.
- Use keyboard navigation.
- Confirm visible focus states.
- Confirm hover, active, disabled, and validation states.
- Confirm `prefers-reduced-motion` behavior.
- Check for horizontal overflow.
- Check article content that extends beyond the normal width.

Stage only the files for the current phase. Review the staged diff before each commit.

## Final verification

The migration is complete only when all these conditions are true:

- `npm run check` passes.
- `npm run test` passes.
- `npm run build` passes.
- Light and dark visual checks pass at all target widths.
- Keyboard and focus checks pass.
- No unintended horizontal scroll exists.
- The production CSS size is recorded and any growth from the baseline has an explanation.
- `package.json` and `package-lock.json` contain no Tailwind-related package.
- `vite.config.ts` contains no Tailwind plugin.
- Source files contain none of these patterns:

```powershell
rg -n "tailwind|@apply|@theme|@plugin|@variant|@custom-variant|twMerge|tailwind-variants|tw-animate" src package.json vite.config.ts
```

- `components.json` is removed or has a documented non-Tailwind purpose.
- `README.md` describes the new CSS architecture.
- No temporary compatibility stylesheet remains.

## Rollback rule

Keep each phase in a separate commit. If a phase causes a visual or behavior regression that cannot be fixed in its scope, revert that phase. Do not restore already verified Tailwind paths from earlier phases.

## Expected result

The final application uses Svelte for component style isolation and standard CSS for all styling. The browser receives static CSS with no styling runtime. The repository has fewer build dependencies, explicit style ownership, and no framework-specific class contract.
