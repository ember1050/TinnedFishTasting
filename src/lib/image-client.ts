/**
 * Browser-only image helpers. Downscales and re-encodes an image so large
 * uploads (e.g. a multi-megapixel phone photo) become small before they ever
 * hit the network or storage. Runs entirely client-side via <canvas>.
 */

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to the <img> path below
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Returns a downscaled WebP (or JPEG fallback) Blob no larger than `maxDim` on
 * its longest edge. Images already smaller than `maxDim` are still re-encoded
 * to shed metadata and compress.
 */
export async function downscaleImage(
  file: File,
  maxDim = 512,
  quality = 0.82
): Promise<Blob> {
  const source = await loadImage(file);
  const srcW =
    source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const srcH =
    source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  if (!srcW || !srcH) throw new Error("That image looks empty.");

  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process that image.");
  ctx.drawImage(source as CanvasImageSource, 0, 0, w, h);
  if (source instanceof ImageBitmap) source.close();

  const blob =
    (await toBlob(canvas, "image/webp", quality)) ??
    (await toBlob(canvas, "image/jpeg", quality));
  if (!blob) throw new Error("Couldn't process that image.");
  return blob;
}
