import { compile as mdsvexCompile } from 'mdsvex';
import * as svelteCompiler from 'svelte/compiler';
import * as svelteClient from 'svelte/internal/client';
import * as svelteDisclose from 'svelte/internal/disclose-version';
import * as svelte from 'svelte';
import { init as lexerInit, parse as lexerParse } from 'es-module-lexer';
import { registry } from './registry';

const registryNames = Object.keys(registry);

const baseModules: Record<string, unknown> = {
  svelte,
  'svelte/internal/client': svelteClient,
  'svelte/internal/disclose-version': svelteDisclose,
};

for (const name of registryNames) {
  baseModules[`preview:${name}`] = {
    default: registry[name as keyof typeof registry],
  };
}

function injectRegistryImports(source: string): string {
  const imports = registryNames
    .map((name) => `  import ${name} from 'preview:${name}';`)
    .join('\n');

  const trimmed = source.trimStart();
  if (/^<script[\s>]/.test(trimmed)) {
    return source.replace(
      /<script(\s[^>]*)?>/,
      (m) => `${m}\n${imports}\n`,
    );
  }
  return `<script>\n${imports}\n</script>\n\n${source}`;
}

function namedBindings(named: string): string {
  return named
    .split(',')
    .map((part) => {
      const p = part.trim();
      if (!p) return '';
      // Drop type-only specifiers (`type Foo`, `type Foo as Bar`) that
      // TypeScript source could carry through mdsvex; compiled Svelte
      // output shouldn't have them, but cheap to be defensive.
      if (/^type\s/.test(p)) return '';
      const asMatch = p.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (asMatch) return `${asMatch[1]}: ${asMatch[2]}`;
      return p;
    })
    .filter(Boolean)
    .join(', ');
}

function safeId(spec: string): string {
  return spec.replace(/[^A-Za-z0-9_]/g, '_');
}

// Turn the binding portion of an `import ... from '<spec>'` statement into
// the equivalent `const` bindings reading from `__modules__[<spec>]`.
//
// The binding portion is the text between `import` and `from` (or empty for
// side-effect imports). Because es-module-lexer has already told us exactly
// where the statement is in the source, the shapes we need to handle here
// are much narrower than the whole-file regex approach this replaced:
//   - '' (side-effect only: `import 'x';`)
//   - 'Default'
//   - 'Default, { a, b as c }'
//   - 'Default, * as NS'
//   - '* as NS'
//   - '{ a, b as c }'
//   - 'type { T }' or starts with 'type ' — dropped (TS type-only, never in
//      compiled Svelte output, but defensive)
function bindingReplacement(bindingText: string, spec: string): string {
  const trimmed = bindingText.trim();
  const modRef = `__modules__[${JSON.stringify(spec)}]`;
  const id = safeId(spec);
  const mName = `__m_${id}`;

  if (!trimmed) return `/* side-effect: ${spec} */`;
  if (/^type\b/.test(trimmed)) return `/* type-only: ${spec} */`;

  let defaultName: string | null = null;
  let namespaceName: string | null = null;
  let namedText: string | null = null;
  let rest = trimmed;

  // Default binding, if present, always comes first. It's a bare identifier
  // optionally followed by `,` then namespace or named.
  const defMatch = rest.match(/^([A-Za-z_$][\w$]*)\s*(?:,\s*|$)/);
  if (defMatch) {
    defaultName = defMatch[1];
    rest = rest.slice(defMatch[0].length);
  }

  // Second binding slot: namespace or named. Not both — ES spec forbids it.
  const nsMatch = rest.match(/^\*\s+as\s+([A-Za-z_$][\w$]*)/);
  if (nsMatch) {
    namespaceName = nsMatch[1];
  } else if (rest.startsWith('{')) {
    const close = rest.lastIndexOf('}');
    if (close > 0) namedText = rest.slice(1, close);
  }

  const lines: string[] = [`const ${mName} = ${modRef};`];
  if (defaultName) {
    lines.push(`const ${defaultName} = ${mName}.default ?? ${mName};`);
  }
  if (namespaceName) {
    lines.push(`const ${namespaceName} = ${mName};`);
  }
  if (namedText) {
    const bindings = namedBindings(namedText);
    if (bindings) lines.push(`const { ${bindings} } = ${mName};`);
  }
  return lines.join('\n');
}

// Static import → `const` rewriting via es-module-lexer. Walks statements
// in reverse so splicing earlier positions doesn't invalidate later spans.
// Only handles static imports; dynamic `import()` and `import.meta` are
// left untouched (d !== -1).
async function rewriteImports(code: string): Promise<string> {
  await lexerInit;
  const [imports] = lexerParse(code);
  let out = code;
  for (let i = imports.length - 1; i >= 0; i--) {
    const imp = imports[i];
    if (imp.d !== -1) continue; // dynamic import / import.meta → leave alone
    const spec = imp.n;
    if (!spec) continue; // unparsable (rare) — skip rather than corrupt

    // Binding text = slice from after `import` to right before the opening
    // quote of the specifier, with trailing `from` stripped.
    const openingQuoteIdx = imp.s - 1;
    const head = out.slice(imp.ss, openingQuoteIdx);
    let bindingText = head.replace(/^\s*import\b/, '');
    bindingText = bindingText.replace(/\bfrom\s*$/, '').trim();

    const replacement = bindingReplacement(bindingText, spec);
    out = out.slice(0, imp.ss) + replacement + out.slice(imp.se);
  }
  return rewriteExports(out);
}

// Export rewriting stays regex-based: the compiled Svelte output only emits
// a small, regular set of export forms (`export default function`, occasional
// `export const` / `export function`). The lexer's ExportSpecifier doesn't
// surface full-statement ranges, so a targeted regex is both simpler and no
// worse than the lexer approach here.
function rewriteExports(src: string): string {
  let out = src;
  out = out.replace(
    /^\s*export\s+default\s+function\s+/gm,
    '__default__ = function ',
  );
  out = out.replace(
    /^\s*export\s+default\s+class\s+/gm,
    '__default__ = class ',
  );
  out = out.replace(
    /^\s*export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/gm,
    '__default__ = $1;',
  );
  out = out.replace(
    /^\s*export\s+\{[^}]*\}\s*(?:from\s+["'][^"']+["'])?\s*;?\s*$/gm,
    '/* export list stripped */',
  );
  out = out.replace(/^\s*export\s+const\s+/gm, 'const ');
  out = out.replace(/^\s*export\s+let\s+/gm, 'let ');
  out = out.replace(/^\s*export\s+function\s+/gm, 'function ');
  out = out.replace(/^\s*export\s+class\s+/gm, 'class ');
  return out;
}

export type CompileResult =
  | { ok: true; Component: unknown }
  | { ok: false; error: string };

export async function compileSvxToComponent(source: string): Promise<CompileResult> {
  try {
    const withImports = injectRegistryImports(source);
    const md = await mdsvexCompile(withImports, { extensions: ['.svx'] });
    if (!md) return { ok: false, error: 'mdsvex returned no output' };

    const compiled = svelteCompiler.compile(md.code, {
      generate: 'client',
      dev: false,
      runes: true,
      hmr: false,
      filename: 'preview.svelte',
    });

    const js = await rewriteImports(compiled.js.code);

    const fn = new Function(
      '__modules__',
      `"use strict";\nlet __default__;\n${js}\nreturn __default__;`,
    );

    // Proxy the module map so a typo'd spec (`<Unknown />` when there's no
    // `Unknown` in the registry) yields an empty object instead of
    // `undefined`. Without this the rewriter emits
    // `__m_preview_Unknown.default ?? __m_preview_Unknown` → TypeError on
    // undefined, which poisons subsequent renders (previous valid instance
    // remains mounted). Returning `{}` makes the render "silently wrong"
    // rather than "permanently broken" while the user fixes the source.
    const modules = new Proxy(
      { ...baseModules } as Record<string, unknown>,
      {
        get(target, prop: string) {
          if (prop in target) return target[prop];
          if (typeof prop === 'string') {
            console.warn(`[preview] unknown module '${prop}' — returning {}`);
          }
          return {};
        },
      },
    );

    const Component = fn(modules);
    if (!Component) return { ok: false, error: 'No default export from compiled source' };
    return { ok: true, Component };
  } catch (e) {
    const err = e as Error;
    return { ok: false, error: err.stack ?? err.message ?? String(err) };
  }
}
