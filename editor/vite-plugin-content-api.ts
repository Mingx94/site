// Tiny dev-only Vite middleware that exposes the editor's fixed workspace
// (../src/content) as a small JSON API. The web editor uses these endpoints
// instead of File System Access API, so the workspace opens automatically
// with no permission grant and no browser picker dance.
//
// Lives only inside `vite dev` (and `vite preview` for local sanity);
// production builds never run it. Endpoints rooted at `/__editor`.

import type { Plugin } from 'vite';
import { promises as fsp } from 'node:fs';
import { dirname, join, resolve, sep, normalize } from 'node:path';
import { URL } from 'node:url';

export type TreeNode =
  | { type: 'dir'; name: string; path: string; children: TreeNode[] }
  | { type: 'file'; name: string; path: string; ext: string };

const IGNORED = new Set([
  'node_modules',
  '.git',
  '.svelte-kit',
  '.next',
  'dist',
  'out',
  'build',
  '.wrangler',
  '.vercel',
  '.cache',
  '.DS_Store',
]);

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i + 1).toLowerCase();
}

async function readTree(absRoot: string, relBase = ''): Promise<TreeNode[]> {
  const entries = await fsp.readdir(join(absRoot, relBase), { withFileTypes: true });
  entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  const out: TreeNode[] = [];
  for (const entry of entries) {
    if (IGNORED.has(entry.name)) continue;
    if (entry.name.startsWith('.') && entry.name !== '.env') continue;
    const childRel = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push({
        type: 'dir',
        name: entry.name,
        path: childRel,
        children: await readTree(absRoot, childRel),
      });
    } else if (entry.isFile()) {
      out.push({
        type: 'file',
        name: entry.name,
        path: childRel,
        ext: extOf(entry.name),
      });
    }
  }
  return out;
}

function safeResolve(root: string, rel: string): string {
  // Reject any attempt to escape the root with .. segments.
  const abs = normalize(join(root, rel));
  const rootWithSep = root.endsWith(sep) ? root : root + sep;
  if (abs !== root && !abs.startsWith(rootWithSep)) {
    throw new Error(`path escapes workspace: ${rel}`);
  }
  return abs;
}

async function readBodyBuffer(req: import('node:http').IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  mp4: 'video/mp4',
  webm: 'video/webm',
  pdf: 'application/pdf',
};

function mimeFor(name: string): string {
  return MIME_BY_EXT[extOf(name)] ?? 'text/plain; charset=utf-8';
}

export function editorContentApi(opts: { root: string }): Plugin {
  const ROOT = resolve(opts.root);

  return {
    name: 'editor-content-api',
    apply: 'serve', // dev + preview only; never in production builds
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__editor/')) return next();

        try {
          const url = new URL(req.url, 'http://x');
          const route = url.pathname.replace(/^\/__editor/, '');

          if (route === '/tree' && req.method === 'GET') {
            const tree = await readTree(ROOT);
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ root: ROOT, tree }));
            return;
          }

          if (route === '/file' && req.method === 'GET') {
            const rel = url.searchParams.get('path');
            if (!rel) {
              res.statusCode = 400;
              res.end('missing path');
              return;
            }
            const abs = safeResolve(ROOT, rel);
            // Read raw bytes; client decides whether to consume as text or
            // blob. MIME is dispatched off the file extension so <img src>
            // works for image assets without a separate endpoint.
            const buf = await fsp.readFile(abs);
            res.setHeader('content-type', mimeFor(rel));
            res.end(buf);
            return;
          }

          if (route === '/file' && req.method === 'PUT') {
            const rel = url.searchParams.get('path');
            if (!rel) {
              res.statusCode = 400;
              res.end('missing path');
              return;
            }
            const abs = safeResolve(ROOT, rel);
            const buf = await readBodyBuffer(req);
            await fsp.mkdir(dirname(abs), { recursive: true });
            // No encoding → raw bytes. UTF-8 text passed through as bytes
            // round-trips identically; binary uploads (images) work too.
            await fsp.writeFile(abs, buf);
            res.statusCode = 204;
            res.end();
            return;
          }

          if (route === '/file' && req.method === 'POST') {
            // Create-only: refuse if file exists. Body is the initial content.
            const rel = url.searchParams.get('path');
            if (!rel) {
              res.statusCode = 400;
              res.end('missing path');
              return;
            }
            const abs = safeResolve(ROOT, rel);
            const buf = await readBodyBuffer(req);
            try {
              await fsp.access(abs);
              res.statusCode = 409;
              res.end('exists');
              return;
            } catch {
              /* not found = ok to create */
            }
            await fsp.mkdir(dirname(abs), { recursive: true });
            await fsp.writeFile(abs, buf);
            res.statusCode = 201;
            res.end();
            return;
          }

          if (route === '/file' && req.method === 'DELETE') {
            const rel = url.searchParams.get('path');
            if (!rel) {
              res.statusCode = 400;
              res.end('missing path');
              return;
            }
            const abs = safeResolve(ROOT, rel);
            const stat = await fsp.stat(abs);
            if (!stat.isFile()) {
              res.statusCode = 400;
              res.end('not a file');
              return;
            }
            await fsp.rm(abs);
            res.statusCode = 204;
            res.end();
            return;
          }

          if (route === '/dir' && req.method === 'POST') {
            const rel = url.searchParams.get('path');
            if (!rel) {
              res.statusCode = 400;
              res.end('missing path');
              return;
            }
            const abs = safeResolve(ROOT, rel);
            try {
              await fsp.access(abs);
              res.statusCode = 409;
              res.end('exists');
              return;
            } catch {
              /* not found = ok to create */
            }
            await fsp.mkdir(abs, { recursive: true });
            res.statusCode = 201;
            res.end();
            return;
          }

          if (route === '/dir' && req.method === 'DELETE') {
            const rel = url.searchParams.get('path');
            if (!rel) {
              res.statusCode = 400;
              res.end('missing path');
              return;
            }
            const abs = safeResolve(ROOT, rel);
            const stat = await fsp.stat(abs);
            if (!stat.isDirectory()) {
              res.statusCode = 400;
              res.end('not a directory');
              return;
            }
            // Recursive delete — caller is expected to confirm in the UI.
            await fsp.rm(abs, { recursive: true, force: true });
            res.statusCode = 204;
            res.end();
            return;
          }

          if (route === '/rename' && req.method === 'PATCH') {
            const from = url.searchParams.get('from');
            const to = url.searchParams.get('to');
            if (!from || !to) {
              res.statusCode = 400;
              res.end('missing from/to');
              return;
            }
            const absFrom = safeResolve(ROOT, from);
            const absTo = safeResolve(ROOT, to);
            try {
              await fsp.access(absTo);
              res.statusCode = 409;
              res.end('target exists');
              return;
            } catch {
              /* not found = ok to rename into */
            }
            await fsp.mkdir(dirname(absTo), { recursive: true });
            await fsp.rename(absFrom, absTo);
            res.statusCode = 204;
            res.end();
            return;
          }

          res.statusCode = 404;
          res.end('not found');
        } catch (e) {
          res.statusCode = 500;
          res.end((e as Error).message);
        }
      });
    },
  };
}
