// Convert any browser-decodable image (PNG, WebP, AVIF, JPEG, GIF) to a
// JPEG Blob. Used by CoverPicker so post covers always land on disk as
// `cover.jpg` regardless of source format — matches the site's
// Cover.svelte glob (`../posts/*/cover.jpg`).
//
// Runs entirely in the browser via OffscreenCanvas — no server-side
// image lib needed. Chromium / Edge / Brave / Arc all support this.
export async function toJpegBlob(file: File, quality = 0.9): Promise<Blob> {
  // Fast path: source is already JPEG and the user hasn't asked us to
  // re-encode. Skip the canvas round-trip to preserve the exact bytes.
  if (file.type === 'image/jpeg') return file;

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');
    ctx.drawImage(bitmap, 0, 0);
    return await canvas.convertToBlob({ type: 'image/jpeg', quality });
  } finally {
    bitmap.close();
  }
}
