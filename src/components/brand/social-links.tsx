import { Instagram, Linkedin, Music2 } from "lucide-react";

export function SocialLinks() {
  const links = [
    { href: "https://www.instagram.com/ingida.bet", label: "Instagram", Icon: Instagram },
    { href: "https://www.tiktok.com/@ingidabet", label: "TikTok", Icon: Music2 },
    { href: "https://www.linkedin.com/company/ingida/", label: "LinkedIn", Icon: Linkedin },
  ];
  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Follow Us</p>
      <div className="flex gap-5 text-primary">
        {links.map(({ href, label, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`INGIDA on ${label} (opens in a new tab)`} className="transition-colors hover:text-gold"><Icon className="h-5 w-5" strokeWidth={1.5} /></a>
        ))}
      </div>
    </div>
  );
}

