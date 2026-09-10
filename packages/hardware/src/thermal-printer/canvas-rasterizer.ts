// packages/hardware/src/thermal-printer/canvas-rasterizer.ts
export interface RasterOptions {
  rollWidthPx?: 576 | 384;
  luminanceThreshold?: number;
  chunkHeight?: number;
}

export class CanvasRasterizer {
  public static canvasToEscPosRaster(
    canvas: HTMLCanvasElement,
    options: RasterOptions = {}
  ): Uint8Array {
    const { luminanceThreshold = 128, chunkHeight = 128 } = options;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not acquire 2D canvas context');

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    const bytesWidth = Math.ceil(width / 8);
    const resultChunks: number[] = [];

    for (let startY = 0; startY < height; startY += chunkHeight) {
      const currentChunkHeight = Math.min(chunkHeight, height - startY);
      const xL = bytesWidth % 256;
      const xH = Math.floor(bytesWidth / 256);
      const yL = currentChunkHeight % 256;
      const yH = Math.floor(currentChunkHeight / 256);

      resultChunks.push(0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH);

      for (let y = startY; y < startY + currentChunkHeight; y++) {
        for (let byteX = 0; byteX < bytesWidth; byteX++) {
          let byteVal = 0;
          for (let bit = 0; bit < 8; bit++) {
            const pxX = byteX * 8 + bit;
            if (pxX < width) {
              const idx = (y * width + pxX) * 4;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];
              const a = pixels[idx + 3];
              const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
              if (a > 50 && luminance < luminanceThreshold) {
                byteVal |= 0x80 >> bit;
              }
            }
          }
          resultChunks.push(byteVal);
        }
      }
    }
    return new Uint8Array(resultChunks);
  }
}