import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { IngidaLogo } from "@/components/brand/ingida-logo";
import { Button } from "@/components/ui/button";
import { tapNfcCard, submitNfcContact, nfcContactSchema, type PublicNfcCard } from "@/lib/nfc.functions";

export const Route = createFileRoute("/nfc/$cardId")({
  loader: async ({ params }) => {
    const result = await tapNfcCard({ data: { cardKey: params.cardId } });
    if (result.status === "ok" && !result.card.capture_mode && result.card.destination_url) {
      throw redirect({ href: result.card.destination_url, statusCode: 302, headers: { "Cache-Control": "no-store" } });
    }
    return result;
  },
  staleTime: 0,
  gcTime: 0,
  shouldReload: true,
  head: () => ({
    meta: [
      { title: "ingida — Exchange Contact" },
      { name: "description", content: "Share your details with an ingida representative and continue to their link." },
      { property: "og:title", content: "ingida — Exchange Contact" },
      { property: "og:description", content: "Tap, connect and continue with ingida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NfcPage,
});

const text = {
  en: { save: "Save Contact to Phone", title: "Let's stay connected", sub: "Share your details and continue.", name: "Full name", phone: "Phone", email: "Email", company: "Company", notes: "Notes (optional)", consent: "I agree to be contacted by ingida.", send: "Share & Continue", skip: "Skip & continue to link", done: "Thank you — taking you there…", doneNoLink: "Thank you — we'll be in touch.", missing: "Unrecognized Card", inactive: "Card Temporarily Inactive", fallback: "Visit ingida" },
  am: { save: "አድራሻውን ያስቀምጡ", title: "እንገናኝ", sub: "መረጃዎን ያጋሩና ይቀጥሉ።", name: "ሙሉ ስም", phone: "ስልክ", email: "ኢሜይል", company: "ድርጅት", notes: "ማስታወሻ (አማራጭ)", consent: "እንግዳ እንዲያገኘኝ እስማማለሁ።", send: "ያጋሩና ይቀጥሉ", skip: "ዝለልና ወደ ሊንኩ ቀጥል", done: "እናመሰግናለን — እየወሰድንዎ ነው…", doneNoLink: "እናመሰግናለን — እናገኝዎታለን።", missing: "ያልታወቀ ካርድ", inactive: "ካርዱ ለጊዜው ተዘግቷል", fallback: "እንግዳን ይጎብኙ" },
};

function vcard(c: PublicNfcCard) {
  const esc = (v: string) => v.replace(/([,;\\])/g, "\\$1");
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${esc(c.owner_name || "ingida")}`, "ORG:ingida"];
  if (c.owner_title) lines.push(`TITLE:${esc(c.owner_title)}`);
  if (c.owner_phone) lines.push(`TEL;TYPE=CELL:${esc(c.owner_phone)}`);
  if (c.owner_email) lines.push(`EMAIL:${esc(c.owner_email)}`);
  if (c.destination_url) lines.push(`URL:${c.destination_url}`);
  lines.push("END:VCARD");
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

function NfcPage() {
  const result = Route.useLoaderData();
  const [lang, setLang] = useState<"en" | "am">("en");
  const t = text[lang];

  return (
    <div lang={lang} className="min-h-dvh bg-navy-deep text-primary-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <IngidaLogo className="h-7 w-auto text-primary-foreground" />
          <button type="button" onClick={() => setLang(lang === "en" ? "am" : "en")} className="text-xs uppercase tracking-[0.16em] text-gold">
            {lang === "en" ? "አማርኛ" : "English"}
          </button>
        </header>
        {result.status !== "ok" ? (
          <div className="my-auto text-center">
            <h1 className="font-serif text-3xl">{result.status === "missing" ? t.missing : t.inactive}</h1>
            <Button asChild variant="outline" className="mt-8 rounded-none border-gold bg-transparent text-gold hover:bg-gold hover:text-navy-deep">
              <Link to="/">{t.fallback}</Link>
            </Button>
          </div>
        ) : (
          <CaptureForm card={result.card} t={t} />
        )}
      </div>
    </div>
  );
}

function CaptureForm({ card, t }: { card: PublicNfcCard; t: (typeof text)["en"] }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [failMsg, setFailMsg] = useState("");
  const go = () => { if (card.destination_url) window.location.href = card.destination_url; };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = nfcContactSchema.safeParse({
      cardId: card.id,
      full_name: f.get("full_name") ?? "", phone: f.get("phone") ?? "", email: f.get("email") ?? "",
      company: f.get("company") ?? "", notes: f.get("notes") ?? "", consent_given: f.get("consent") === "on",
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] ??= issue.message;
      setErrors(errs);
      return;
    }
    setErrors({}); setState("busy"); setFailMsg("");
    try {
      await submitNfcContact({ data: parsed.data });
      setState("done");
      setTimeout(go, 1500);
    } catch {
      setState("idle"); setFailMsg("Something went wrong. Please try again.");
    }
  };

  const field = "w-full border-b border-primary-foreground/25 bg-transparent py-3 text-base outline-none placeholder:text-primary-foreground/50 focus:border-gold";

  return (
    <main className="mt-10 flex flex-1 flex-col">
      <p className="text-xs uppercase tracking-[0.18em] text-gold">{card.card_name}</p>
      {card.owner_name && <p className="mt-3 font-serif text-2xl">{card.owner_name}{card.owner_title && <span className="block text-sm text-primary-foreground/70">{card.owner_title}</span>}</p>}
      {(card.owner_phone || card.owner_email) && (
        <Button asChild variant="outline" className="mt-5 h-11 rounded-none border-gold bg-transparent text-xs uppercase tracking-[0.14em] text-gold hover:bg-gold hover:text-navy-deep">
          <a href={vcard(card)} download={`${card.owner_name || "ingida"}.vcf`}>{t.save}</a>
        </Button>
      )}
      {state === "done" ? (
        <p role="status" className="my-auto text-center font-serif text-2xl">{card.destination_url ? t.done : t.doneNoLink}</p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-8 space-y-3">
          <h1 className="font-serif text-3xl">{t.title}</h1>
          <p className="text-sm text-primary-foreground/70">{t.sub}</p>
          {(["full_name", "phone", "email", "company"] as const).map((n) => (
            <div key={n}>
              <input name={n} aria-label={t[n === "full_name" ? "name" : n]} placeholder={t[n === "full_name" ? "name" : n]} type={n === "email" ? "email" : n === "phone" ? "tel" : "text"} maxLength={n === "email" ? 255 : 120} className={field} />
              {errors[n] && <p className="mt-1 text-xs text-gold">{errors[n]}</p>}
            </div>
          ))}
          <textarea name="notes" aria-label={t.notes} placeholder={t.notes} maxLength={500} rows={2} className={field} />
          <label className="flex items-start gap-3 pt-2 text-sm text-primary-foreground/80">
            <input type="checkbox" name="consent" className="mt-1 accent-gold" />
            <span>{t.consent}</span>
          </label>
          {errors.consent_given && <p className="text-xs text-gold">{errors.consent_given}</p>}
          {failMsg && <p role="alert" className="text-xs text-gold">{failMsg}</p>}
          <Button type="submit" disabled={state === "busy"} className="mt-4 h-12 w-full rounded-none bg-gold text-xs uppercase tracking-[0.16em] text-navy-deep hover:bg-gold-soft">
            {state === "busy" ? "…" : t.send}
          </Button>
          {card.destination_url && (
            <button type="button" onClick={go} className="block w-full pt-3 text-center text-xs text-primary-foreground/60 underline">{t.skip}</button>
          )}
        </form>
      )}
    </main>
  );
}
