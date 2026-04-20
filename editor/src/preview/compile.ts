import { compile as mdsvexCompile } from 'mdsvex';
import * as svelteCompiler from 'svelte/compiler';
import * as svelteClient from 'svelte/internal/client';
import * as svelteDisclose from 'svelte/internal/disclose-version';
import * as svelte from 'svelte';
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

function rewriteImports(code: string): string {
  const M = '__modules__';
  let src = code;

  src = src.replace(
    /^\s*import\s+["']([^"']+)["']\s*;?\s*$/gm,
    (_m, spec: string) => `/* side-effect: ${spec} */`,
  );

  src = src.replace(
    /^\s*import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["']\s*;?\s*$/gm,
    (_m, ident: string, spec: string) =>
      `const ${ident} = ${M}[${JSON.stringify(spec)}];`,
  );

  src = src.replace(
    /^\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]*)\}\s+from\s+["']([^"']+)["']\s*;?\s*$/gm,
    (_m, def: string, named: string, spec: string) => {
      const id = safeId(spec);
      return `const __m_${id} = ${M}[${JSON.stringify(spec)}];\nconst ${def} = __m_${id}.default ?? __m_${id};\nconst { ${namedBindings(named)} } = __m_${id};`;
    },
  );

  src = src.replace(
    /^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["']\s*;?\s*$/gm,
    (_m, def: string, spec: string) => {
      const id = safeId(spec);
      return `const __m_${id} = ${M}[${JSON.stringify(spec)}];\nconst ${def} = __m_${id}.default ?? __m_${id};`;
    },
  );

  src = src.replace(
    /^\s*import\s+\{([^}]*)\}\s+from\s+["']([^"']+)["']\s*;?\s*$/gm,
    (_m, named: string, spec: string) =>
      `const { ${namedBindings(named)} } = ${M}[${JSON.stringify(spec)}];`,
  );

  src = src.replace(
    /^\s*export\s+default\s+function\s+/gm,
    '__default__ = function ',
  );
  src = src.replace(
    /^\s*export\s+default\s+class\s+/gm,
    '__default__ = class ',
  );
  src = src.replace(
    /^\s*export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/gm,
    '__default__ = $1;',
  );

  src = src.replace(
    /^\s*export\s+\{[^}]*\}\s*(?:from\s+["'][^"']+["'])?\s*;?\s*$/gm,
    '/* export list stripped */',
  );
  src = src.replace(/^\s*export\s+const\s+/gm, 'const ');
  src = src.replace(/^\s*export\s+let\s+/gm, 'let ');
  src = src.replace(/^\s*export\s+function\s+/gm, 'function ');
  src = src.replace(/^\s*export\s+class\s+/gm, 'class ');

  return src;
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

    const js = rewriteImports(compiled.js.code);

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
