import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Instagram, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import socks from "@/assets/ingida-socks.png.asset.json";

export type MerchResult = { code: string | null; item: string | null; already: boolean };

export function Reward({ result }: { result: MerchResult }) {
  const [busy, setBusy] = useState(false);

  async function exportSticker(share: boolean) {
    setBusy(true);
    try {
      const image = await createImageBitmap(await (await fetch(socks.url)).blob());
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      // Export colours reuse the same semantic palette as the reward display.
      const tokens = getComputedStyle(document.documentElement);
      ctx.fillStyle = tokens.getPropertyValue("--background").trim();
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = tokens.getPropertyValue("--primary").trim();
      ctx.textAlign = "center";
      ctx.font = "bold 112px Georgia";
      ctx.fillText("ingida", 540, 340);
      ctx.font = "bold 64px Arial";
      ctx.fillText("ALL MY INGIDAS EAT", 540, 540);
      const scale = Math.min(800 / image.width, 700 / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      ctx.drawImage(image, (1080 - w) / 2, 640 + (700 - h) / 2, w, h);
      image.close();
      ctx.font = "bold 54px Arial";
      ctx.fillText("#allmyingidaseat", 540, 1510);
      ctx.font = "36px Arial";
      ctx.fillText("My INGIDA Moment", 540, 1590);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Export failed")), "image/png"));
      const file = new File([blob], "my-ingida-moment.png", { type: "image/png" });
      const shareText = `My INGIDA Moment — redeem All My Ingidas Eat socks with #allmyingidaseat ${window.location.origin}`;
      if (share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My INGIDA Moment", text: shareText });
      } else if (share && navigator.share) {
        await navigator.share({ title: "My INGIDA Moment", text: shareText, url: window.location.origin });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        if (share) await navigator.clipboard?.writeText(shareText).catch(() => {});
        toast.success(share ? "Sticker saved and caption copied — post it to your Story." : "Sticker saved — ready for your Instagram Story.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) toast.error("Couldn't save your sticker. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-5 py-7 text-center animate-in fade-in duration-300">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your INGIDA Moment</p>
        <h2 className="mt-2 font-serif text-4xl font-semibold text-primary">All My Ingidas Eat</h2>
        <p className="mt-1 text-sm text-muted-foreground">{result.code ? "Your socks. Your welcome." : "You're on the list — today's socks are all claimed."}</p>
      </div>
      <div className="flex flex-col items-center gap-2 border-y border-border py-5">
        <div className="bg-background p-1 text-primary">
          <QRCodeSVG value={result.code ?? "#allmyingidaseat"} size={160} fgColor="currentColor" bgColor="var(--background)" level="M" title="Show this QR to an INGIDA host" />
        </div>
        {result.code && <p className="break-all font-mono text-xl font-bold text-primary">{result.code}</p>}
        <p className="text-[10px] text-muted-foreground">Show this QR to an INGIDA host to collect</p>
      </div>
      <div className="merch-stage flex items-center gap-4 p-4 text-left">
        <img src={socks.url} alt="All My Ingidas Eat socks" className="h-28 w-28 shrink-0 object-contain" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{result.code ? (result.already ? "Your Saved Drop" : "Merch Drop") : "Merch Drop"}</p>
          <p className="mt-1 font-serif text-xl font-bold text-primary">All My Ingidas Eat Socks</p>
          <p className="mt-1 break-all text-sm font-bold text-primary">#allmyingidaseat</p>
          <p className="mt-1 text-xs text-muted-foreground">{result.code ? "Show your code to an INGIDA host." : "Watch for the next drop."}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="ig-sticker flex min-w-0 -rotate-2 items-center gap-2 rounded-lg border-2 border-primary px-3 py-3 text-primary">
          <Instagram className="h-5 w-5 shrink-0" />
          <span className="text-left text-xs font-bold leading-tight">My INGIDA Moment<br /><span className="text-[10px] font-medium">#allmyingidaseat</span></span>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" title="Download Instagram Story sticker" aria-label="Download Instagram Story sticker" disabled={busy} onClick={() => exportSticker(false)}><Download /></Button>
          <Button variant="ghost" size="icon" title="Share Instagram Story sticker" aria-label="Share Instagram Story sticker" disabled={busy} onClick={() => exportSticker(true)}><Share2 /></Button>
        </div>
      </div>
    </section>
  );
}