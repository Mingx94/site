// Convert any browser-decodable image (PNG, WebP, AVIF, JPEG, GIF) to a
// JPEG Blob. Used by CoverPicker so post covers always land on disk as
// `cover.jpg` regardless of source format — matches the site's
// Cover.svelte glob (`../posts/*/cover.jpg`).
//
// Runs entirely in the browser. Prefers OffscreenCanvas (Chromium / Edge /
// Brave / Arc / Firefox 105+ / Safari 17+); falls back to a regular
// `<canvas>` element on older engines.

export type JpegOptions = {
  quality?: number;
  // Hard cap on the longest side. Source images larger than this are
  // downscaled with aspect ratio preserved before encoding. Avoids OOM
  // on huge phone-camera or RAW images.
  maxDimension?: number;
};

const DEFAULTS: Required<JpegOptions> = { quality: 0.9, maxDimension: 4000 };

export async function toJpegBlob(
  file: File,
  options: JpegOptions = {},
): Promise<Blob> {
  const { quality, maxDimension } = { ...DEFAULTS, ...options };

  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = scaleToFit(bitmap.width, bitmap.height, maxDimension);
    const noResize = width === bitmap.width && height === bitmap.height;

    // Fast path: source is already JPEG and within size bounds — skip the
    // canvas round-trip to preserve the exact bytes (no quality loss).
    if (file.type === 'image/jpeg' && noResize) return file;

    return await drawAndEncode(bitmap, width, height, quality);
  } finally {
    bitmap.close();
  }
}

function scaleToFit(w: number, h: number, max: number): { width: number; height: number } {
  const longest = Math.max(w, h);
  if (longest <= max) return { width: w, height: h };
  const ratio = max / longest;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

async function drawAndEncode(
  bitmap: ImageBitmap,
  w: number,
  h: number,
  quality: number,
): Promise<Blob> {
  // Prefer OffscreenCanvas — async encoding via convertToBlob, no DOM hit.
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');
    ctx.drawImage(bitmap, 0, 0, w, h);
    return await canvas.convertToBlob({ type: 'image/jpeg', quality });
  }
  // Fallback: regular canvas element + Promise wrapper around toBlob.
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2D context unavailable');
  ctx.drawImage(bitmap, 0, 0, w, h);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob produced null'))),
      'image/jpeg',
      quality,
    );
  });
}
