// Tiny dev-only Vite middleware that exposes the editor's fixed workspace
// (../src/content) as a small JSON API. The web editor uses these endpoints
// instead of File System Access API, so the workspace opens automatically
// with no permission grant and no browser picker dance.
//
// Lives only inside `vite dev`. `configureServer` does not run in `vite
// preview`, and the `apply(env)` gate below refuses to attach during build
// or preview even if the plugin list changes later. Production Workers
// bundles never include this file. Endpoints rooted at `/__editor`.

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

export function safeResolve(root: string, rel: string): string {
  // Reject any attempt to escape the root with .. segments.
  const abs = normalize(join(root, rel));
  const rootWithSep = root.endsWith(sep) ? root : root + sep;
  if (abs !== root && !abs.startsWith(rootWithSep)) {
    throw new Error(`path escapes workspace: ${rel}`);
  }
  return abs;
}

// Only allow requests originating from the local machine. Without this,
// running `vite --host` (for phone testing) or sitting on a shared network
// would let any LAN device `curl -XPUT` against the content API. The socket
// peer address is authoritative — Host / Origin headers are client-controlled.
export function isLocalRequest(req: import('node:http').IncomingMessage): boolean {
  const addr = req.socket.remoteAddress ?? '';
  return (
    addr === '127.0.0.1' ||
    addr === '::1' ||
    addr === '::ffff:127.0.0.1' ||
    // Unix-socket connections have no remote address; those only happen on
    // the local machine.
    addr === ''
  );
}

async function readBodyBuffer(req: import('node:http').IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

// Windows holds a shared-read but exclusive-write lock on files that the
// dev server's `enhanced-img` plugin has cached (notably `cover.jpg`),
// which makes in-place overwrites race the cache and fail with EBUSY /
// EPERM / UNKNOWN. The unlink-then-write workaround is robust because:
//   1. `unlink` succeeds even while the file is read-locked — Windows
//      retains the open handles against the now-orphaned inode.
//   2. The fresh `writeFile` creates a new inode that isn't locked.
// We still retry transient errors before falling back to the unlink path
// so a normal text-edit save (which doesn't conflict with enhanced-img)
// completes in one syscall.
async function writeFileResilient(abs: string, buf: Buffer): Promise<void> {
  const transientCodes = new Set(['EBUSY', 'EPERM', 'UNKNOWN', 'EACCES']);
  const delays = [25, 60, 120];
  for (let i = 0; i <= delays.length; i++) {
    try {
      await fsp.writeFile(abs, buf);
      return;
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code ?? '';
      if (!transientCodes.has(code)) throw e;
      if (i === delays.length) break;
      await new Promise((r) => setTimeout(r, delays[i]));
    }
  }
  // In-place overwrite kept failing — fall back to unlink + write fresh.
  try {
    await fsp.unlink(abs);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code ?? '';
    if (code !== 'ENOENT') throw e;
  }
  await fsp.writeFile(abs, buf);
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
    // Dev server only. `vite build` runs with command === 'build'; `vite
    // preview` sets `env.isPreview`. Both are refused so the middleware
    // cannot be attached by accident when a built editor bundle is served.
    apply(_, env) {
      return env.command === 'serve' && !env.isPreview;
    },
    configureServer(server) {
      // Push out-of-band file change events to the renderer so that an edit
      // made in another editor (VS Code, etc.) is reflected without the user
      // hitting "重新整理". Reads chokidar events from Vite's own watcher and
      // forwards anything under our content root over the HMR channel.
      server.watcher.add(ROOT);
      const events = ['add', 'change', 'unlink', 'addDir', 'unlinkDir'] as const;
      for (const evt of events) {
        server.watcher.on(evt, (filePath: string) => {
          if (typeof filePath !== 'string') return;
          const rel = filePath
            .replace(/\\/g, '/')
            .startsWith(ROOT.replace(/\\/g, '/') + '/')
            ? filePath.replace(/\\/g, '/').slice(ROOT.replace(/\\/g, '/').length + 1)
            : null;
          if (rel === null) return;
          // Filter out anything inside an IGNORED segment.
          if (rel.split('/').some((s) => IGNORED.has(s))) return;
          server.ws.send({
            type: 'custom',
            event: 'editor:fs',
            data: { type: evt, path: rel },
          });
        });
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__editor/')) return next();

        // Localhost-only: anyone on the LAN could otherwise read or overwrite
        // site content when the dev server is exposed with `--host`.
        if (!isLocalRequest(req)) {
          res.statusCode = 403;
          res.end('forbidden: editor API is localhost-only');
          return;
        }

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
            const stat = await fsp.stat(abs);
            res.setHeader('content-type', mimeFor(rel));
            // Quoted-mtime ETag — cheap and monotonic. Used by the client
            // to send `If-Match` on PUT so a save racing an external edit
            // gets a 409 instead of silently clobbering.
            res.setHeader('etag', `"${stat.mtimeMs}"`);
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
            // If-Match: client echoes the etag it received on the last
            // GET. When it doesn't match current disk mtime, disk has
            // changed under us — abort with 409 so the client can show a
            // conflict dialog rather than clobber the external edit.
            const ifMatch = req.headers['if-match'];
            if (ifMatch && typeof ifMatch === 'string' && ifMatch !== '*') {
              try {
                const stat = await fsp.stat(abs);
                const current = `"${stat.mtimeMs}"`;
                if (current !== ifMatch) {
                  res.statusCode = 409;
                  res.setHeader('etag', current);
                  res.end('conflict: disk modified');
                  return;
                }
              } catch (e) {
                // File didn't exist at client's etag time — treat as
                // conflict rather than creating a new one.
                if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
                  res.statusCode = 409;
                  res.end('conflict: file missing');
                  return;
                }
                throw e;
              }
            }
            const buf = await readBodyBuffer(req);
            await fsp.mkdir(dirname(abs), { recursive: true });
            // No encoding → raw bytes. UTF-8 text passed through as bytes
            // round-trips identically; binary uploads (images) work too.
            await writeFileResilient(abs, buf);
            const stat = await fsp.stat(abs).catch(() => null);
            if (stat) res.setHeader('etag', `"${stat.mtimeMs}"`);
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
            await writeFileResilient(abs, buf);
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
