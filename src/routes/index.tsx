import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Utensils,
  BedDouble,
  ShoppingBasket,
  Palmtree,
  Ticket,
  Instagram,
  Linkedin,
  Music2,
} from "lucide-react";

import appPhones from "@/assets/ingida-wallet-navy.jpg";
import { IngidaLogo } from "@/components/brand/ingida-logo";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { submitWaitlist } from "@/lib/waitlist.functions";
import { waitlistSchema } from "@/lib/waitlist-schema";

const skylineLoop = "/Web.mp4";
const skylinePoster = "/Visit.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ingida — Ethiopian Hospitality & Rewards Wallet" },
      { name: "description", content: "Explore Addis Ababa and Ethiopia with ingida’s hospitality rewards network. Discover dining, stays, tourism and local merchants. Join the rewards wallet waitlist." },
      { property: "og:title", content: "ingida — Ethiopian Hospitality & Rewards Wallet" },
      { property: "og:description", content: "Discover Ethiopia’s cities, dining, stays and local merchants with ingida. A hospitality network and rewards wallet, made in Addis Ababa." },
      { name: "twitter:title", content: "ingida — Ethiopian Hospitality & Rewards Wallet" },
      { name: "twitter:description", content: "Explore Ethiopia’s hospitality, tourism and local merchants. Join ingida’s rewards wallet waitlist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Lang = "en" | "am";

const copy = {
  en: {
    tagline: "Guest",
    heroHeadline: null,
    ctaJoin: "Request Invitation",
    howEyebrow: "Membership",
    howTitle: "Spend. Earn & Redeem.",
    howLead: "Join once. Earn across the city.",
    howBody: "",
    steps: [
      { n: "01", t: "Join", d: "Verify once with your FAYDA ID." },
      { n: "02", t: "Earn", d: "Scan an ETH QR when you spend with a partner." },
      { n: "03", t: "Redeem", d: "Use your rewards across participating partners." },
    ],
    portals: [
      {
        tag: "Rewards App",
        name: "ingida Member",
        desc: "Your membership, your network, your welcome, in one place.",
        href: "https://reward-rhythm.lovable.app",
      },
      {
        tag: "Loyalty Dashboard",
        name: "ingida Merchant",
        desc: "Recognise regulars, host with intention, grow with the circle.",
        href: "#",
      },
    ],
    networkEyebrow: "The Network",
    networkTitle: "Loyalty network. Rewards wallet.",
    cats: [
      { icon: Utensils, name: "Dine", note: "Restaurants & cafés" },
      { icon: BedDouble, name: "Stay", note: "Boutique hotels & lodges" },
      { icon: ShoppingBasket, name: "Shop", note: "Ateliers & concept stores" },
      { icon: Palmtree, name: "Travel", note: "Tours & transport" },
      { icon: Ticket, name: "Access", note: "Private moments & experiences" },
    ],
    waitlistEyebrow: "Early Access",
    waitlistTitle: "Becoming ingida",
    waitlistSub: "",
    namePh: "Full name",
    emailPh: "Email",
    phonePh: "Phone number",
    businessPh: "Name of business",
    alertsQ: "Receive alerts?",
    yes: "Yes",
    no: "No",
    roleMember: "I'm a member",
    roleMerchant: "I'm a merchant",
    submit: "Request invite",
    submitted: "Your invitation request has been received.",
    footNote: "Made in Addis Ababa",
    footAdmin: "Operators",
  },
  am: {
    tagline: "እንግዳ",
    heroHeadline: null,
    ctaJoin: "ተጋበዙ",
    howEyebrow: "አባልነት",
    howTitle: "እንግዳ ይጠቀሙ። ነጥብ ያግኙ። ይሽለሙ።",
    howLead: "አንዴ ይመዝገቡ። በከተማው ሁሉ ያግኙ።",
    howBody: "በመላው ኢትዮጵያ የጋራ አቀባበል።",
    steps: [
      { n: "01", t: "በFAYDA ይመዝገቡ", d: "በFAYDA መታወቂያዎ አንዴ ያረጋግጡና ይጀምሩ።" },
      { n: "02", t: "ተገበዙ፣ ሽልማት ያግኙ", d: "በአጋር ንግድ ቤቶች ሲገዙ የETH QR ኮድን በክፍያ አፕዎ ይቃኙ። ሽልማትዎን ያግኙ።" },
      { n: "03", t: "ሽልማትዎን ይጠቀሙ", d: "በአንድ አጋር ቦታ ያገኙትን ሽልማት በሚቀበሉ ሌሎች የእንግዳ አጋር ቦታዎችም ይጠቀሙ።" },
    ],
    portals: [
      {
        tag: "ደንበኞች",
        name: "የደንበኞች አፕ",
        desc: "የሚወዷቸው ቦታዎች፣ ሽልማቶችዎ እና ዋሌትዎ — ሁሉም በአንድ ቦታ።",
        href: "https://reward-rhythm.lovable.app",
      },
      {
        tag: "ነጋዴዎች",
        name: "የነጋዴዎች ዳሽቦርድ",
        desc: "ቋሚ ደንበኞችዎን ይለዩ። እንዲመለሱ ምክንያት ይስጧቸው።",
        href: "#",
      },
    ],
    networkEyebrow: "አውታረ መረቡ",
    networkTitle: "የእንግዳ አጋር ኔትወርክ",
    cats: [
      { icon: Utensils, name: "መአድ", note: "ሬስቶራንቶችና ካፌዎች" },
      { icon: BedDouble, name: "ማረፍ", note: "ቡቲክ ሆቴሎችና ሎጆች" },
      { icon: ShoppingBasket, name: "ግዢ", note: "አትሌዎችና ኮንሴፕት ሱቆች" },
      { icon: Palmtree, name: "ጉዞ", note: "ጉብኝትና መጓጓዣ" },
      { icon: Ticket, name: "ልዩ ተሞክሮዎች", note: "ልዩ ጊዜዎችና ተሞክሮዎች" },
    ],
    waitlistEyebrow: "ቅድመ መዳረሻ",
    waitlistTitle: "የእንግዳ አካል ይሁኑ",
    waitlistSub: "",
    namePh: "ሙሉ ስም",
    emailPh: "ኢሜይል",
    phonePh: "ስልክ ቁጥር",
    businessPh: "የንግድ ቤቱ ስም",
    alertsQ: "ማሳወቂያ ይቀበሉ?",
    yes: "አዎ",
    no: "አይ",
    roleMember: "ደንበኛ ነኝ",
    roleMerchant: "ነጋዴ ነኝ",
    submit: "ተጋበዙ",
    submitted: "በዝርዝሩ ውስጥ ተካትተዋል። በቅርቡ እናገኝዎታለን።",
    footNote: "ከአዲስ አበባ የተሠራ",
    footAdmin: "ኦፕሬተሮች",
  },
};

type Copy = typeof copy.en;

function Index() {
  const [lang, setLang] = useState<Lang>("en");
  const t = copy[lang];

  useEffect(() => {
    document.documentElement.lang = lang === "am" ? "am" : "en";
    document.documentElement.style.setProperty(
      "--font-sans",
      lang === "am"
        ? '"Noto Sans Ethiopic", "DM Sans", system-ui, sans-serif'
        : '"DM Sans", system-ui, sans-serif',
    );
  }, [lang]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Hero t={t} lang={lang} setLang={setLang} />
      <main className="editorial-content">
        <How t={t} />
      </main>
      <Waitlist t={t} />
      <Portals t={t} />
      <Footer t={t} />
    </div>
  );
}

function Nav({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <header className="language-nav relative z-40 w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-end px-6 py-6 md:px-10 md:py-7">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            type="button"
            onClick={() => setLang("en")}
            className={`h-7 rounded-none px-1 text-[11px] hover:bg-transparent hover:text-gold ${
              lang === "en" ? "border-b border-gold text-gold" : "text-primary-foreground/70"
            }`}
            aria-pressed={lang === "en"}
          >
            EN
          </Button>
          <span className="text-primary-foreground/30" aria-hidden>/</span>
          <Button
            variant="ghost"
            type="button"
            onClick={() => setLang("am")}
            className={`h-7 rounded-none px-1 text-[11px] hover:bg-transparent hover:text-gold ${
              lang === "am" ? "border-b border-gold text-gold" : "text-primary-foreground/70"
            }`}
            aria-pressed={lang === "am"}
          >
            አማርኛ
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero({ t, lang, setLang }: { t: Copy; lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <section
      id="top"
      className="hospitality-hero relative flex flex-col items-center overflow-hidden bg-navy-deep text-primary-foreground"
    >
      <Nav lang={lang} setLang={setLang} />
      <ImageStrip t={t} />
      <Network t={t} />
    </section>
  );
}

function ImageStrip({ t }: { t: Copy }) {
  const showcaseRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = showcaseRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={showcaseRef} className={`wallet-feature ${revealed ? "is-revealed" : ""}`} aria-label="ingida rewards app preview">
      <div className="wallet-feature-inner">
        <div className="wallet-feature-copy">
          <h1 aria-label="ingida"><IngidaLogo className="hero-logo" /></h1>
          <p className="eyebrow moment-line">{t === copy.en ? <>CAPTURE THIS <span>#INGIDAMOMENT</span></> : <span className="moment-tag">#ክቡርእንግዳ</span>}</p>
          <h2>{t === copy.en ? <>More than a Wallet.<br /><em>A Lifestyle.</em></> : <span className="am-hero-title">እንግዳ ቆይታ</span>}</h2>
          <div className="wallet-feature-labels">
            {t === copy.en ? <><span>Loyalty Network.</span><span>Rewards Wallet.</span></> : <span>ልዩ የእንግዳ ቆይታ እና አጋር ኔትወርክ</span>}
          </div>
        </div>
        <figure className="app-showcase">
          <img src={appPhones} alt="ingida hospitality home screen and rewards wallet on two phones" className="app-showcase-phones" fetchPriority="high" />
        </figure>
      </div>
    </section>
  );
}

function Network({ t }: { t: Copy }) {
  return (
    <section id="network" className="network-ribbon">
      <div className="network-ribbon-inner">
        <ul className="network-categories">
          {t.cats.map((c) => {
            const Icon = c.icon;
            return (
              <li
                key={c.name}
                className="network-category"
              >
                <Icon className="network-icon" strokeWidth={1.4} aria-hidden />
                <h3>
                  {c.name}
                </h3>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function How({ t }: { t: Copy }) {
  return (
    <section id="how" className="how-section how-white bg-white text-navy-deep py-16 md:py-24">
      <div className="how-inner how-split max-w-5xl mx-auto px-6 md:px-8">
        <div className="how-lead">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold">
            {t.howEyebrow}
          </p>
          <h2 className="font-serif text-[34px] md:text-[46px] leading-[1.15] text-navy-deep mt-3">
            {t.howLead}
          </h2>
        </div>

        <ol className="how-steps-list border-t border-navy-deep/15">
          {t.steps.map((s) => (
            <li
              key={s.n}
              className="grid grid-cols-[44px_1fr] gap-2 py-5 border-b border-navy-deep/15"
            >
              <span className="text-xs font-mono text-gold pt-1">{s.n}</span>
              <div>
                <h3 className="font-serif text-[22px] md:text-[24px] text-navy-deep leading-snug">
                  {s.t}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-navy-deep/70">
                  {s.d}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="skyline-stage mt-10 md:mt-16 w-full overflow-hidden" aria-hidden="true">
        <video
          className="addis-skyline w-full h-auto object-cover"
          src={skylineLoop}
          poster={skylinePoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </section>
  );
}

function Portals({ t }: { t: Copy }) {
  const [members, merchants] = t.portals;
  return (
    <section id="portals" className="bg-background py-10 text-navy-deep md:py-14">
      <div className="mx-auto grid max-w-5xl gap-6 px-5 md:grid-cols-2 md:gap-10 md:px-8">
        <PortalRow p={members} />
        <PortalRow p={merchants} />
      </div>
    </section>
  );
}

function PortalRow({ p }: { p: Copy["portals"][number] }) {
  return (
    <a
      href={p.href}
      target={p.href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="portal-row group block pt-5 text-center md:pt-6"
    >
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-[9.5px] font-medium tracking-[0.28em] uppercase text-gold">{p.tag}</p>
        <h3 className="font-serif text-[22px] italic leading-tight text-navy-deep md:text-[28px]">
          {(() => {
            const parts = p.name.split(" ");
            const last = parts.pop() ?? "";
            const rest = parts.join(" ");
            return (
              <>
                {rest ? <>{rest} </> : null}
                <span className="text-gold">{last}</span>
              </>
            );
          })()}
        </h3>

        <p className="max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
          {p.desc}
        </p>
      </div>
    </a>
  );
}

function renderWaitlistTitle(title: string) {
  const tokens = ["ingida", "እንግዳ"];
  for (const tok of tokens) {
    const idx = title.indexOf(tok);
    if (idx !== -1) {
      return (
        <>
          {title.slice(0, idx)}
          <span className="font-serif italic text-gold">{tok}</span>
          {title.slice(idx + tok.length)}
        </>
      );
    }
  }
  return title;
}

function Waitlist({ t }: { t: Copy }) {
  const [role, setRole] = useState("member");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const saveRequest = useServerFn(submitWaitlist);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form.entries());
    const result = waitlistSchema.safeParse(raw);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    setState("sending");
    setError("");
    try {
      await saveRequest({ data: raw });
      setState("done");
    } catch {
      setState("idle");
      setError(t === copy.en ? "Your request could not be saved. Please try again." : "ጥያቄዎ አልተቀመጠም። እንደገና ይሞክሩ።");
    }
  };

  return (
    <section
      id="waitlist"
      className="early-access relative overflow-hidden bg-navy-deep text-primary-foreground"
    >
      <div className="early-access-content reveal-up relative mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 text-center md:px-8">
        <div className="flex flex-col items-center">
          <p className="text-[9.5px] font-medium tracking-[0.3em] uppercase text-gold">
            {t.waitlistEyebrow}
          </p>
          <h2 className="mt-3 font-serif text-[24px] leading-[1.1] md:text-[34px]">
            {role === "member"
              ? (t === copy.en ? <>Your Digital Wallet.<br /><em className="text-gold">Rewarded.</em></> : <>የእርስዎ ዲጂታል ዋሌት።<br /><span className="text-gold">በሽልማት ተሸልሟል።</span></>)
              : renderWaitlistTitle(t.waitlistTitle)}
          </h2>
          {t.waitlistSub ? (
            <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-primary-foreground/70 md:text-[13.5px]">
              {t.waitlistSub}
            </p>
          ) : null}
        </div>
        <div className="w-full max-w-md">
          {state === "done" ? (
            <div role="status" className="flex min-h-[140px] flex-col items-center justify-center border-t border-primary-foreground/20 pt-4">
              <div className="mb-3 h-px w-8 bg-gold" aria-hidden />
              <p className="font-serif text-lg italic text-gold md:text-xl">{t.submitted}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3 text-left">
              <div className="hidden" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
              <Field name="name" placeholder={t.namePh} required />
              <Field name="phone" type="tel" placeholder={t.phonePh} required />
              <Field name="email" type="email" placeholder={t.emailPh} required />
              {role === "merchant" ? (
                <Field name="business_name" placeholder={t.businessPh} required />
              ) : (
                <fieldset className="flex items-center gap-4 border-b border-primary-foreground/30 py-3">
                  <legend className="sr-only">{t.alertsQ}</legend>
                  <span aria-hidden className="flex-1 text-base text-primary-foreground/70">{t.alertsQ}</span>
                  <AlertChip value="yes" label={t.yes} />
                  <AlertChip value="no" label={t.no} />
                </fieldset>
              )}
              <div className="flex gap-2 pt-1" onChangeCapture={(event) => {
                const input = event.target;
                if (input instanceof HTMLInputElement && input.name === "role") setRole(input.value);
              }}>
                <RoleChip name="role" value="member" label={t.roleMember} defaultChecked />
                <RoleChip name="role" value="merchant" label={t.roleMerchant} />
              </div>
              <div className="flex justify-center pt-1">
                <Button
                  type="submit"
                  variant="ghost"
                  disabled={state === "sending"}
                  className="invite-submit group text-gold hover:bg-gold hover:text-navy-deep"
                >
                  {state === "sending" ? (t === copy.en ? "Sending…" : "በመላክ ላይ…") : t.submit} <span aria-hidden>→</span>
                </Button>
              </div>
              {error && <p role="alert" className="text-center text-sm text-gold-soft">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  placeholder,
  type = "text",
  required,
}: {
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        maxLength={name === "email" ? 255 : name === "phone" ? 30 : 100}
        autoComplete={name === "name" ? "name" : name === "email" ? "email" : name === "phone" ? "tel" : "organization"}
        className="w-full border-b border-primary-foreground/30 bg-transparent py-3 text-base text-primary-foreground placeholder:text-primary-foreground/70 outline-none transition-colors focus:border-gold"
      />
    </label>
  );
}

function AlertChip({ value, label }: { value: string; label: string }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name="alerts" value={value} className="peer sr-only" />
      <span className="block border-b border-transparent px-2 py-1 text-xs text-primary-foreground/80 peer-checked:border-gold peer-checked:text-gold peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold">
        {label}
      </span>
    </label>
  );
}

function RoleChip({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex-1 cursor-pointer">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="block border-b border-primary-foreground/30 px-1 py-3 text-center text-xs text-primary-foreground/80 peer-checked:border-gold peer-checked:text-gold peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold">
        {label}
      </span>
    </label>
  );
}

function Footer({ t }: { t: Copy }) {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="border-t border-border/60 bg-background py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 text-center md:px-8">
        <div className="flex items-center justify-center gap-4">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-gold">
            <Instagram className="h-4 w-4" strokeWidth={1.5} />
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="text-muted-foreground transition-colors hover:text-gold">
            <Music2 className="h-4 w-4" strokeWidth={1.5} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-muted-foreground transition-colors hover:text-gold">
            <Linkedin className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-3 border-t border-border/60 pt-4 text-[9.5px] tracking-[0.22em] uppercase text-muted-foreground">
          <p>© {year} · {t.footNote}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a href="mailto:home@ingida.com" className="hover:text-foreground">home@ingida.com</a>
            <span aria-hidden className="opacity-40">·</span>
            <a href="#" className="hover:text-foreground">{t === copy.en ? "Terms of Use" : "የአጠቃቀም ውሎች"}</a>
            <span aria-hidden className="opacity-40">·</span>
            <a href="#" className="hover:text-foreground">{t === copy.en ? "Privacy Policy" : "የግላዊነት ፖሊሲ"}</a>
            <span aria-hidden className="opacity-40">·</span>
            <a href="#" className="hover:text-foreground">{t === copy.en ? "Cookies" : "ኩኪዎች"}</a>
            <span aria-hidden className="opacity-40">·</span>
            <Link to="/operators" className="hover:text-foreground">{t.footAdmin}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
