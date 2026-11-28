export type StickerDetails = { title: string; hashtag: string; image: string };

export async function createSticker({ title, hashtag, image }: StickerDetails): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(60, 60, 880, 880, 12);
  ctx.stroke();
  ctx.textAlign = "center";
  const fitText = (text: string, y: number, size: number) => {
    ctx.font = `500 ${size}px "DM Sans", sans-serif`;
    while (ctx.measureText(text).width > 800 && size > 16) { size -= 2; ctx.font = `500 ${size}px "DM Sans", sans-serif`; }
    ctx.fillText(text, 500, y);
  };
  fitText(title, 165, 54);
  fitText("My INGIDA Moment", 245, 42);
  if (image) {
    const response = await fetch(image);
    if (!response.ok) throw new Error("Image unavailable");
    const bitmap = await createImageBitmap(await response.blob());
    const scale = Math.min(640 / bitmap.width, 500 / bitmap.height);
    const w = bitmap.width * scale, h = bitmap.height * scale;
    ctx.drawImage(bitmap, (1000 - w) / 2, 295 + (500 - h) / 2, w, h);
    bitmap.close();
  }
  fitText(hashtag, 865, 52);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG unavailable")), "image/png"));
}

export function downloadSticker(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = "my-ingida-moment.png";
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}