import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { Download, Instagram, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import socks from "@/assets/ingida-socks.png.asset.json";

export type MerchResult = { code: string | null; item: string | null; already: boolean; pending?: boolean; description?: string | null; image?: string | null };

export function Reward({ result }: { result: MerchResult }) {
  const [busy, setBusy] = useState(false);
  // Merch Drop always reflects the live inventory Quest prize.
  const [drop, setDrop] = useState<{ item: string; description: string; image: string } | null>(null);
  useEffect(() => {
    supabase.rpc("quest_prize_preview").then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) setDrop({ item: row.item, description: row.description, image: row.image });
    });
  }, []);
  const item = result.item || drop?.item || "INGIDA Merch";
  const description = result.description || drop?.description || "";
  const image = result.image || drop?.image || socks.url;

  async function exportSticker(target: "instagram" | "snapchat" | "download") {
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(await (await fetch(image)).blob());
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const tokens = getComputedStyle(document.documentElement);
      const paper = tokens.getPropertyValue("--background").trim();
      const ink = tokens.getPropertyValue("--primary").trim();
      // Transparent canvas: only the tilted sticker is painted.
      ctx.translate(500, 500);
      ctx.rotate(-0.06);
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.roundRect(-400, -330, 800, 660, 60);
      ctx.fillStyle = paper;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.lineWidth = 14;
      ctx.strokeStyle = ink;
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.font = "bold 92px Georgia";
      ctx.fillText("ingida", 0, -210);
      ctx.font = "bold 46px Arial";
      ctx.fillText("MY INGIDA MOMENT", 0, -140);
      const scale = Math.min(420 / bitmap.width, 300 / bitmap.height);
      const w = bitmap.width * scale;
      const h = bitmap.height * scale;
      ctx.drawImage(bitmap, -w / 2, -110 + (300 - h) / 2, w, h);
      bitmap.close();
      ctx.font = "bold 50px Arial";
      ctx.fillText("#MyingidaMoment", 0, 260);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Export failed")), "image/png"));
      const file = new File([blob], "my-ingida-moment.png", { type: "image/png" });
      const shareText = `My INGIDA Moment #MyingidaMoment ${window.location.origin}/quest`;
      if (target !== "download" && navigator.canShare?.({ files: [file] })) {
        toast.message(`Pick ${target === "instagram" ? "Instagram → Story" : "Snapchat"} in the share menu.`);
        // Instagram and Snapchat only accept the image; the caption goes to the clipboard.
        await navigator.clipboard?.writeText(shareText).catch(() => {});
        await navigator.share({ files: [file] });
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      await navigator.clipboard?.writeText(shareText).catch(() => {});
      if (target === "download") toast.success("Sticker saved.");
      else {
        toast.success(`Sticker saved — add it from your photos in ${target === "instagram" ? "your Instagram Story" : "Snapchat"}.`);
        window.location.href = target === "instagram" ? "instagram://story-camera" : "snapchat://";
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) toast.error("Couldn't make your sticker. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-5 py-7 text-center animate-in fade-in duration-300">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your INGIDA Moment</p>
        <h2 className="mt-2 font-serif text-4xl font-normal text-primary">MendSpace x Lock In</h2>
        <p className="mt-1 text-sm text-muted-foreground">{result.pending ? "We're checking your reward inventory…" : result.code ? `Your ${item}. Your welcome.` : "You're on the list — today's drop is all claimed."}</p>
      </div>
      {result.code ? (
        <div className="flex flex-col items-center gap-2 border-y border-border py-5" aria-label="Redemption code">
          <div className="bg-background p-1 text-primary">
            <QRCodeSVG value={result.code} size={160} fgColor="currentColor" bgColor="var(--background)" level="M" title="Redemption QR code — show this to an INGIDA host" />
          </div>
          <p className="break-all font-mono text-xl font-bold text-primary">{result.code}</p>
          <p className="text-[10px] text-muted-foreground">Show this QR or code to an INGIDA host to collect{result.item ? ` your ${result.item}` : ""}.</p>
        </div>
      ) : (
        <div className="border-y border-border py-5" role="status" aria-live="polite">
          <p className="font-semibold text-primary">{result.pending ? "Your redemption code is being prepared." : "No redemption code is available right now."}</p>
          <p className="mt-1 text-sm text-muted-foreground">{result.pending ? "Keep this page open while we check the reward inventory." : "Today's codes may be fully claimed. Please check with an INGIDA host."}</p>
        </div>
      )}
      <div className="merch-stage flex items-center gap-4 p-4 text-left">
        <img src={image} alt={item} className="h-28 w-28 shrink-0 object-contain" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{result.code ? (result.already ? "Your Saved Drop" : "Merch Drop") : "Merch Drop"}</p>
          <p className="mt-1 font-serif text-xl font-normal text-primary">{item}</p>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          <p className="mt-1 break-all text-sm font-bold text-primary">#MyingidaMoment</p>
          <p className="mt-1 text-xs text-muted-foreground">{result.code ? "Show your code to an INGIDA host." : "Watch for the next drop."}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="ig-sticker flex min-w-0 -rotate-2 items-center gap-2 rounded-lg border-2 border-primary px-3 py-3 text-primary">
          <Instagram className="h-5 w-5 shrink-0" />
          <span className="text-left text-xs font-bold leading-tight">My INGIDA Moment<br /><span className="text-[10px] font-medium">#MyingidaMoment</span></span>
        </div>
        <Button variant="ghost" size="icon" title="Save sticker" aria-label="Save transparent sticker" disabled={busy} onClick={() => exportSticker("download")}><Download /></Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button className="rounded-full" disabled={busy} onClick={() => exportSticker("instagram")}><Instagram /> IG Story</Button>
        <Button variant="outline" className="rounded-full" disabled={busy} onClick={() => exportSticker("snapchat")}><Share2 /> Snapchat</Button>
      </div>
    </section>
  );
}
