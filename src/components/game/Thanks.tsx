import { Instagram, Linkedin, Music2 } from "lucide-react";
import { questCopy } from "@/lib/quest-copy";

export function Thanks({ am }: { am: boolean }) {
  const t = questCopy[am ? "am" : "en"];
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center" role="status">
      <h2 className="font-serif text-3xl font-normal leading-tight text-primary">{t.thanks}</h2>
      <p className="max-w-xs text-muted-foreground">{t.follow}</p>
      <nav className="flex flex-wrap justify-center gap-5 text-primary" aria-label={am ? "ማኅበራዊ ገጾች" : "INGIDA Socials"}>
        <a href="https://www.instagram.com/ingida.bet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline-offset-4 hover:underline"><Instagram className="h-4 w-4" />{am ? "ኢንስታግራም" : "Instagram"}</a>
        <a href="https://www.tiktok.com/@ingidabet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline-offset-4 hover:underline"><Music2 className="h-4 w-4" />{am ? "ቲክቶክ" : "TikTok"}</a>
        <a href="https://www.linkedin.com/company/ingida/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline-offset-4 hover:underline"><Linkedin className="h-4 w-4" />{am ? "ሊንክድኢን" : "LinkedIn"}</a>
      </nav>
    </section>
  );
}