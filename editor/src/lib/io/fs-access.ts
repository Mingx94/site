// Browser-side wrappers around the editor's dev-only Vite middleware
// (see editor/vite-plugin-content-api.ts). The workspace is fixed to
// site/src/content; paths are workspace-relative forward-slash strings
// (e.g. 'posts/why-astro/article.svx').

export type TreeNode =
  | { type: 'dir'; name: string; path: string; children: TreeNode[] }
  | { type: 'file'; name: string; path: string; ext: string };

const BASE = '/__editor';

async function checkOk(res: Response, ctx: string): Promise<Response> {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${ctx} failed (${res.status}): ${body || res.statusText}`);
  }
  return res;
}

export async function readTree(): Promise<TreeNode[]> {
  const res = await fetch(`${BASE}/tree`);
  await checkOk(res, 'readTree');
  const data = (await res.json()) as { root: string; tree: TreeNode[] };
  return data.tree;
}

export async function readFileRel(path: string): Promise<string> {
  const res = await fetch(`${BASE}/file?path=${encodeURIComponent(path)}`);
  await checkOk(res, `readFile(${path})`);
  return await res.text();
}

export async function writeFileRel(path: string, content: string): Promise<void> {
  const res = await fetch(`${BASE}/file?path=${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body: content,
  });
  await checkOk(res, `writeFile(${path})`);
}

export async function createFileRel(path: string, body = ''): Promise<string> {
  const res = await fetch(`${BASE}/file?path=${encodeURIComponent(path)}`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body,
  });
  await checkOk(res, `createFile(${path})`);
  return path;
}

export async function deleteFileRel(path: string): Promise<void> {
  const res = await fetch(`${BASE}/file?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
  await checkOk(res, `deleteFile(${path})`);
}

export async function createDirRel(path: string): Promise<void> {
  const res = await fetch(`${BASE}/dir?path=${encodeURIComponent(path)}`, {
    method: 'POST',
  });
  await checkOk(res, `createDir(${path})`);
}

export async function deleteDirRel(path: string): Promise<void> {
  const res = await fetch(`${BASE}/dir?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
  await checkOk(res, `deleteDir(${path})`);
}

export async function renamePathRel(from: string, to: string): Promise<void> {
  const res = await fetch(
    `${BASE}/rename?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { method: 'PATCH' },
  );
  await checkOk(res, `rename(${from} → ${to})`);
}

// Upload a binary blob (image, video, …) to a workspace-relative path.
// Server stores the bytes verbatim; MIME is inferred from the path's
// extension on later GETs.
export async function uploadFileRel(path: string, blob: Blob): Promise<void> {
  const res = await fetch(`${BASE}/file?path=${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'content-type': blob.type || 'application/octet-stream' },
    body: blob,
  });
  await checkOk(res, `upload(${path})`);
}

// Direct browser-readable URL for a workspace asset — feed straight into
// `<img src>`, `<video src>`, etc. Includes no cache-busting; callers that
// need fresh data after an upload should append their own `&v=…` token.
export function assetUrlFor(path: string): string {
  return `${BASE}/file?path=${encodeURIComponent(path)}`;
}
