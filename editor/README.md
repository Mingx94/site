# SVX Editor

An Obsidian-style desktop editor for `.svx` files with a **real mdsvex preview** — your custom Svelte components (`<Notice>`, `<Tabs>`, `<Cover>`…) are compiled at runtime and rendered as actual Svelte instances, not an HTML facsimile.

Built for writing long-form posts in mixed Markdown + Svelte, the way [mdsvex](https://github.com/pngwn/MDsveX) and SvelteKit blogs use `.svx`.

<p align="center">
  <img src="resources/icon.png" alt="SVX Editor icon" width="128" />
</p>

---

## Feature tour

- **Open any folder as a vault** — file tree with Lucide icons, per-extension glyphs, dirty-mark dot.
- **Multi-tab editor** — CodeMirror 6 core with per-file undo history, list continuation on Enter, Tab/Shift-Tab indent, `⌘F` find panel, soft wrap.
- **Real-time preview** — mdsvex → svelte.compile → mount runs on every keystroke (180 ms debounce), errors surface as an inline red card without nuking the last good render.
- **Three preview modes** — side-by-side / editor-only / preview-only, switchable via toolbar or `⌘\`.
- **Right-side rail** — Frontmatter form (title / description / date / updated / draft / tags), Outline (from `# / ## / ###`), Component palette (drag or double-click to insert a `<Notice>` / `<Tabs>` / `<Cover>` / `<Video>` / `<Accordion>` / `<Button>` snippet).
- **Command palette** (`⌘K`) — fuzzy file-open, jumps straight to a file by name or relative path.
- **Tweaks panel** (`✎`) — live-swap paper tone (warm / cool / neutral), accent (朱 / 藍 / 綠 / 紫), editor font (等寬 / 襯線 / 手寫), density (舒適 / 緊湊). Persists in electron-store.
- **Paper-themed UI** — warm cream card + dark-brown ink, Caveat handwritten titles, Newsreader serif body, JetBrains Mono code.
- **Windows-native window chrome** — frameless, min/max/close on the right with full-height buttons and a real red close hover.
- **Unsaved-changes guard** — closing the window with dirty buffers pops a paper-themed dialog (儲存全部 / 不儲存直接關閉 / 取消).
- **Accessibility** — file tree is a real ARIA `tree` with roving tabindex, arrow-key navigation, Home/End, Enter to open, Left/Right to collapse/expand; visible focus rings everywhere.
- **Zero git integration** (intentional) — dirty state is buffer-vs-disk, not VCS.

---

## Tech stack

| Layer | Choice |
|---|---|
| Desktop shell | **Electron 33** (frameless BrowserWindow, custom titlebar) |
| Build pipeline | **electron-vite 5** (main / preload / renderer with HMR) |
| Renderer | **Svelte 5** (runes) + **Vite 6**. No SvelteKit — single-page desktop app, no routing needed |
| Editor core | **CodeMirror 6** (`@codemirror/state/view/commands/language/search/autocomplete`, `lang-markdown` + `language-data` for nested code fences) |
| Preview | **mdsvex** + `svelte/compiler` compiled in-browser at runtime, wired to a custom linker |
| Filesystem | `node:fs/promises` + **chokidar** (watcher) + **electron-store** (recents + tweaks) |
| Icons | `@lucide/svelte` (stroke SVG set) |
| Utilities | `gray-matter` (frontmatter), `marked` (fallback markdown), `sharp` + `png-to-ico` (build-time icon rasterisation) |

---

## How it works — preview pipeline

The core trick is runtime Svelte compilation inside the renderer. `src/preview/compile.ts`:

1. **Inject imports** — prepends a `<script>` block into the user's SVX source with one `import X from 'preview:X'` line per component in the registry (`Notice`, `Tabs`, `Tab`, `Cover`, `Video`, `Accordion`, `Button`).
2. **Run mdsvex** — `compile(source, { extensions: ['.svx'] })` produces a full Svelte component source (script + markup).
3. **Run svelte/compiler** — `svelte.compile(mdsvexOutput, { generate: 'client', runes: true, dev: false })` emits a JS module that imports from `svelte`, `svelte/internal/client`, `svelte/internal/disclose-version`, and each `preview:*` identifier.
4. **Rewrite imports** — a regex pass replaces every `import` form (side-effect / namespace / default / named / mixed) with `const X = __modules__[spec]` reads against a module table. Export-default becomes `__default__ = …`.
5. **Link & invoke** — the rewritten JS is wrapped in `new Function('__modules__', …)`. The module table is assembled from the renderer's statically-imported `svelte`, `svelte/internal/client`, `svelte/internal/disclose-version`, plus `{ default: PreviewComponent }` entries for each registry name.
6. **Mount** — the returned constructor is fed to Svelte 5's `mount()` with the current file's frontmatter as props. Previous instance is `unmount()`ed before re-render.

This way your `<Notice type="tip">` inside SVX is the *real* `preview/Notice.svelte`, with `setContext` / `getContext` / `$state` / reactivity all intact — not a string-template lookalike. See `src/preview/compile.ts` and `src/preview/DynamicSvx.svelte`.

---

## Directory layout

```
electron/
  main.ts          BrowserWindow + IPC (fs read/write, watch, tweaks, window controls,
                   close-confirmation handshake)
  preload.ts       contextBridge — window.electron typed API
  fs.ts            readTree / readFile / writeFile / chokidar watcher

src/
  App.svelte       shell: Welcome ↔ Workspace, global shortcuts, close-confirm wiring
  app.css          paper theme (design ported from a Claude Design HTML handoff)
  app.ts           renderer entry

  components/
    Titlebar.svelte           vault / path breadcrumb, ⌘K button, Tweaks button,
                              Windows-style min/max/close with SVG glyphs
    Sidebar.svelte            search + "VAULT" section + FileTree host
    FileTree.svelte           ARIA tree, roving tabindex, full keyboard nav
    TabBar.svelte             scrolling row of open files with dirty dots
    Toolbar.svelte            markdown format buttons + preview-mode segmented control
    EditorPane.svelte         CodeMirror 6 host, per-file state Map, drop handler
    PreviewPane.svelte        frontmatter header + <DynamicSvx /> body
    Rail.svelte               3 tabs: Frontmatter / Outline / Components
    FrontmatterForm.svelte    title / description / date / updated / draft / tags
    Outline.svelte            heading list jumping by #id into preview
    Palette.svelte            6 draggable component cards
    StatusBar.svelte          word / reading-time count + preview mode + save status
    CommandPalette.svelte     ⌘K modal: file fuzzy-search with ↑↓↵ keyboard nav
    TweaksPanel.svelte        paperTone / accent / editorFont / density toggles
    UnsavedDialog.svelte      close-confirm modal (Save all / Discard / Cancel)
    Welcome.svelte            first-launch card with Open / Recent

  preview/
    registry.ts               name → component map
    compile.ts                mdsvex → svelte.compile → new Function linker
    DynamicSvx.svelte         debounced (180ms) render host
    Notice.svelte Tabs.svelte Tab.svelte Cover.svelte Video.svelte
      Accordion.svelte Button.svelte
                              paper-themed copies of the site's custom components
                              (class-prefixed .rc-* so app.css themes them)

  lib/
    cm/theme.ts               CM6 EditorView.theme + HighlightStyle — both driven by
                              CSS vars so Tweaks swaps font / accent live
    cm/extensions.ts          baseExtensions() — line numbers, history, search,
                              markdown lang, lineWrapping, filtered keymap
    editor-actions.ts         registerEditor / applyMarkdown / insertAtCursor /
                              insertAtPos — all CM EditorView dispatch under the hood
    frontmatter.ts            parseDoc / composeDoc (YAML-ish subset)
    outline.ts                extractOutline (# - #### headings + slug)
    util.ts                   wordCount / readingTime / slugify / basename / relative
    state/                    Svelte 5 $state modules
      workspace.svelte.ts       root / tree / expanded set / recents
      tabs.svelte.ts            open / active / previewMode / railOpen / railTab
      files.svelte.ts           byPath buffer cache + disk mirror + dirty helpers
      tweaks.svelte.ts          paperTone / accent / editorFont / density, applies
                                CSS vars + persists via electron-store
      ui.svelte.ts              cmdOpen, outlineActive

resources/
  icon.svg     source design
  icon.png     512×512 (linux / mac)
  icon.ico     multi-res (16–256) for Windows

scripts/
  build-icons.mjs    sharp + png-to-ico rasteriser — run via `npm run build:icons`
```

---

## Getting started

Requires Node 22+ and npm. This repo targets Windows (custom window chrome, NSIS installer), but dev should run on macOS and Linux too.

```bash
git clone <repo-url> svx-editor
cd svx-editor
npm install
npm run dev            # Electron window + HMR
```

First launch shows the Welcome card. Click **開啟工作區…** and pick any folder — the file tree populates with `.svx` / `.md` / `.json` / `.yaml` / other text files (filterable by extension in `FileTree.svelte`'s `EDITABLE_EXT` set). Double-click or press Enter on any editable file to open it in a tab.

### Production build

```bash
npm run build          # main / preload / renderer → out/
npm run package        # + electron-builder → dist/
```

`package` produces an NSIS installer on Windows, AppImage on Linux, DMG on macOS. Icon is bundled from `resources/`.

### Regenerate the icon

Edit `resources/icon.svg`, then:

```bash
npm run build:icons    # writes icon.png (512²) + icon.ico (16, 24, 32, 48, 64, 128, 256)
```

### Typecheck

```bash
npm run check          # svelte-check + tsc
```

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘/Ctrl + K` | Open command palette (fuzzy file search) |
| `⌘/Ctrl + S` | Save current file |
| `⌘/Ctrl + W` | Close current tab |
| `⌘/Ctrl + O` | Pick a new workspace folder |
| `⌘/Ctrl + \` | Toggle right rail |
| `⌘/Ctrl + B` | Bold (via toolbar action) |
| `⌘/Ctrl + I` | Italic (via toolbar action) |
| `⌘/Ctrl + F` | Open CodeMirror find panel (editor-scoped) |
| `⌘/Ctrl + Z` / `⌘/Ctrl + Shift + Z` | Undo / redo (per-file history) |
| `Tab` / `Shift + Tab` | Indent / outdent (markdown list nesting) |
| `Enter` on a `- ` or `1. ` line | Continue list |
| `Esc` | Close command palette / tweaks / find panel |
| `↑ ↓ ← →` | Navigate the file tree (ARIA tree widget) |
| `Home` / `End` | Jump to first / last row in file tree |

---

## Custom window chrome

The BrowserWindow is `frame: false` — a custom `<Titlebar>` component draws:

- Left: vault name + relative path of the active file + "● N modified" badge
- Right app-controls: `⌘K`, rail toggle, Tweaks (`✎`)
- Far right: Windows-style **minimize / maximize / close** drawn with inline SVG, 46 × 38 px per button, red (`#e81123`) hover on close, restore icon swaps via the main-process `maximize` / `unmaximize` IPC events.

The titlebar itself is `-webkit-app-region: drag`; interactive children opt out with `.no-drag`.

---

## State model

Everything reactive lives in a `.svelte.ts` module under `src/lib/state/`. Svelte 5 `$state` objects are reactive when imported, so cross-component reads "just work":

- **`workspace`** — `{ root, rootName, tree, expanded: Set<string>, recent, loading, error }`. `openWorkspace(path)` replaces the tree + starts the chokidar watcher.
- **`tabs`** — `{ open: string[], active, previewMode, railOpen, railTab }`. `openTab(path)` ensures the file is loaded into `files` then adds/activates.
- **`files`** — `{ byPath: { [path]: { name, path, content, diskContent } } }`. `isDirty(path)` compares buffer vs disk. `saveFile` writes via IPC and syncs `diskContent`. `updateContent` is called from CM's `updateListener`.
- **`tweaks`** — the user-tuning surface. Each setter applies CSS vars on `document.documentElement` + persists via `window.electron.tweaksSet`.
- **`ui`** — ephemeral bits: command palette open, active outline slug.

---

## Design provenance

The paper-editor look was not AI-improvised — it came from a high-fidelity HTML/CSS handoff via [Claude Design](https://claude.ai/design). The original React/Babel prototype lives under `.design-reference/` for traceability (not shipped). The Svelte rewrite mirrors the layout decisions and CSS tokens verbatim; the git panel from the original was intentionally dropped.

---

## Intentional non-features

- **No git integration.** Dirty status is file-buffer vs disk only.
- **No default workspace.** First launch is always the Welcome card.
- **No scroll-sync between editor and preview.** The preview is a full-fidelity Svelte render, not a 1:1 DOM mirror.
- **No Shiki in the editor.** Code fences get CM6's built-in language highlight — Shiki is preview-side future work if needed.
- **No Vim / Emacs bindings.** CodeMirror default keymap only.

---

## Credits

- [CodeMirror 6](https://codemirror.net/) for the editor core.
- [mdsvex](https://mdsvex.com/) for the Svelte-flavoured markdown compiler.
- [Lucide](https://lucide.dev/) for icons.
- Claude Design for the original paper-theme UI handoff.
- Svelte 5 team for runes.
