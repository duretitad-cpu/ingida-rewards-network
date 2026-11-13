import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { IngidaLogo } from "@/components/brand/ingida-logo";

export type LegalSection = { h: string; body: ReactNode };

export function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <div className="min-h-dvh bg-background text-navy-deep">
      <header className="flex items-center justify-between border-b border-border px-6 py-5 md:px-10">
        <Link to="/" aria-label="ingida home"><IngidaLogo className="footer-logo" /></Link>
        <nav className="flex gap-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <Link to="/terms" activeProps={{ className: "text-gold" }}>Terms</Link>
          <Link to="/privacy" activeProps={{ className: "text-gold" }}>Privacy</Link>
          <Link to="/cookies" activeProps={{ className: "text-gold" }}>Cookies</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Website Policies</p>
        <h1 className="mt-3 font-serif text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: November 2026</p>
        <div className="mt-10 space-y-8">
          {sections.map((s, i) => (
            <section key={s.h}>
              <h2 className="font-serif text-xl">{i + 1}. {s.h}</h2>
              <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-muted-foreground">{s.body}</div>
            </section>
          ))}
        </div>
        <p className="mt-14 text-sm"><Link to="/" className="text-gold underline">Back to ingida</Link></p>
      </main>
    </div>
  );
}

export const Mail = () => <a href="mailto:home@ingida.com" className="text-gold underline">home@ingida.com</a>;
export const List = ({ items }: { items: string[] }) => <ul className="list-disc space-y-1 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
