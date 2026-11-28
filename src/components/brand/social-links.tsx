import { Instagram, Linkedin, Music2 } from "lucide-react";

export function SocialLinks() {
  return <div className="space-y-3 text-center">
    <p className="text-sm text-muted-foreground">Follow Us On Our Socials</p>
    <div className="flex justify-center gap-4">
      {[
        { name: "Instagram", href: "https://www.instagram.com/ingida.bet", Icon: Instagram },
        { name: "TikTok", href: "https://www.tiktok.com/@ingidabet", Icon: Music2 },
        { name: "LinkedIn", href: "https://www.linkedin.com/company/ingida/", Icon: Linkedin },
      ].map(({ name, href, Icon }) => <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`INGIDA on ${name} (opens in a new tab)`} className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-primary hover:text-gold"><Icon className="h-5 w-5" /></a>)}
    </div>
  </div>;
}