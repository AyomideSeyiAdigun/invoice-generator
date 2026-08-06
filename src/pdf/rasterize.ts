// jsPDF's addImage() only understands raster formats (PNG/JPEG) — it can't
// place an SVG. Everything that ends up in the PDF (the logo, the footer
// icons, the partner-association logos) gets rasterized to a PNG data URL
// once up front, at a fixed pixel size well above its printed size so it
// stays crisp.

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const svgToDataUrl = (svgMarkup: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

export interface RasterImage {
  dataUrl: string;
  /** height / width, so callers can size in the PDF without distorting it */
  aspect: number;
}

// Rasterizes any image source (SVG/PNG/JPEG URL) to a PNG data URL,
// preserving the image's natural aspect ratio at the given target width.
async function rasterize(src: string, targetWidthPx: number): Promise<RasterImage> {
  const img = await loadImage(src);
  const aspect = img.naturalHeight / img.naturalWidth || 1;
  const canvas = document.createElement("canvas");
  canvas.width = targetWidthPx;
  canvas.height = Math.round(targetWidthPx * aspect);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL("image/png"), aspect };
}

export const rasterizeSvg = (svgMarkup: string, targetWidthPx = 128) =>
  rasterize(svgToDataUrl(svgMarkup), targetWidthPx);

export const rasterizeUrl = (url: string, targetWidthPx = 256) => rasterize(url, targetWidthPx);
