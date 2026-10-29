import { createFileRoute } from "@tanstack/react-router";
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
import skylineWhite from "@/assets/skyline-navy-white.jpg";
import appPhones from "@/assets/ingida-wallet-navy.jpg";
import { IngidaLogo } from "@/components/brand/ingida-logo";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { submitWaitlist } from "@/lib/waitlist.functions";
import { waitlistSchema } from "@/lib/waitlist-schema";


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
    howBody:
      "",
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
    cityPh: "City",
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
    howBody:
      "በመላው ኢትዮጵያ የጋራ አቀባበል።",
    steps: [
      { n: "01", t: "በFAYDA ይመዝገቡ", d: "በFAYDA መታወቂያዎ አንዴ ያረጋግጡና ይጀምሩ።" },
      { n: "02", t: "ተገበዙ፣ ሽልማት ያግኙ", d: "በአጋር ንግድ ቤቶች ሲገዙ የETH QR ኮድን በክፍያ አፕዎ ይቃኙ። ሽልማትዎን ያግኙ።" },
      { n: "03", t: "ሽልማትዎን ይጠቀሙ", d: "በአንድ አጋር ቦታ ያገኙትን ሽልማት በሚቀበሉ ሌሎች የኢንጊዳ አጋር ቦታዎችም ይጠቀሙ።" },
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
    networkTitle: "የኢንጊዳ አጋር ኔትወርክ",
    cats: [
      { icon: Utensils, name: "መአድ", note: "ሬስቶራንቶችና ካፌዎች" },
      { icon: BedDouble, name: "ማረፍ", note: "ቡቲክ ሆቴሎችና ሎጆች" },
      { icon: ShoppingBasket, name: "ግዢ", note: "አትሌዎችና ኮንሴፕት ሱቆች" },
      { icon: Palmtree, name: "ጉዞ", note: "ጉብኝትና መጓጓዣ" },
      { icon: Ticket, name: "ልዩ ተሞክሮዎች", note: "ልዩ ጊዜዎችና ተሞክሮዎች" },
    ],
    waitlistEyebrow: "ቅድመ መዳረሻ",
    waitlistTitle: "የኢንጊዳ አካል ይሁኑ",
    waitlistSub: "",

    namePh: "ሙሉ ስም",
    emailPh: "ኢሜይል",
    phonePh: "ስልክ ቁጥር",
    cityPh: "ከተማ",
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
      <Portals t={t} />
      <IconStrip />
      <Waitlist t={t} />
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
          <Button asChild variant="ghost" className="hero-cta h-12 rounded-none border border-gold/60 px-6 text-sm font-medium text-primary-foreground hover:bg-gold hover:text-navy-deep">
            <a href="#waitlist" className="group">{t.ctaJoin}<span aria-hidden className="transition-transform group-hover:translate-x-1">→</span></a>
          </Button>
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
        <h2 className="network-ribbon-title">
          {t === copy.en ? <><span>Your Digital Wallet.</span><span>Rewarded.</span></> : <span>በሽልማት የታጀበ እንግዳ አቀባበል</span>}
        </h2>
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
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el?.style.setProperty("--p", "1"); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (r.height + window.innerHeight * 0.2)));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section id="how" ref={ref} className="how-section how-neon">
      <div className="skyline-stage" aria-hidden="true">
        <img className="addis-skyline" src={skylineWhite} alt="" loading="lazy" />
        <span className="neon-pin pin-stay" style={{ left: "30%", top: "14%" }}>Skyline Stay <em>+350 pts</em></span>
        <span className="neon-pin pin-cathedral" style={{ left: "22%", top: "40%" }}>Cathedral Dine <em>+120 pts</em></span>
        <span className="neon-pin pin-stadium" style={{ left: "58.5%", top: "71%" }}>Stadium Access <em>+200 pts</em></span>
        <span className="neon-pin pin-hall" style={{ left: "72%", top: "30%" }}>Africa Hall Tours <em>+90 pts</em></span>
        <span className="neon-pin pin-lion" style={{ left: "86%", top: "26%" }}>Lion of Judah <em>+150 pts</em></span>
      </div>
      <div className="how-inner reveal-up">
        <p className="eyebrow">{t.howEyebrow}</p>
        <h2 className="how-title">
          {t === copy.en ? <><span className="italic text-gold">Spend.</span> Earn <span className="text-gold">&amp;</span> Redeem.</> : t.howTitle}
        </h2>
        <ol className="how-steps">
          {t.steps.map((s) => (
            <li key={s.n}>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Portals({ t }: { t: Copy }) {
  const [members, merchants] = t.portals;
  return (
    <section id="portals" className="bg-navy-deep py-10 text-primary-foreground md:py-14">
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
      className="group block border-t border-primary-foreground/25 pt-5 text-center md:pt-6"
    >
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-[9.5px] font-medium tracking-[0.28em] uppercase text-gold">{p.tag}</p>
        <h3 className="font-serif text-[22px] italic leading-tight text-primary-foreground md:text-[28px]">
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

        <p className="max-w-md text-[12.5px] leading-relaxed text-primary-foreground/70">
          {p.desc}
        </p>
        <span
          aria-hidden
          className="mt-1 text-lg text-gold transition-transform group-hover:translate-x-1 md:text-xl"
        >
          →
        </span>
      </div>
    </a>
  );
}

function IconStrip() {
  const icons = [Utensils, BedDouble, ShoppingBasket, Palmtree, Ticket];
  return (
    <div className="brand-interlude bg-navy-deep text-primary-foreground" aria-label="ingida hospitality network">
      <IngidaLogo className="interlude-logo" />
      <div className="interlude-icons" aria-hidden="true">
        {icons.map((Icon, i) => (
          <Icon
            key={i}
            className="h-5 w-5 text-gold"
            strokeWidth={1.5}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

function renderWaitlistTitle(title: string) {
  const tokens = ["ingida", "ኢንጊዳ"];
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
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const saveRequest = useServerFn(submitWaitlist);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;
    const form = new FormData(e.currentTarget);
    const result = waitlistSchema.safeParse(Object.fromEntries(form.entries()));
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    setState("sending");
    setError("");
    try {
      await saveRequest({ data: result.data });
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
            {renderWaitlistTitle(t.waitlistTitle)}
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
              <Field name="email" type="email" placeholder={t.emailPh} required />
              <Field name="phone" type="tel" placeholder={t.phonePh} required />
              <Field name="city" placeholder={t.cityPh} />
              <div className="flex gap-2 pt-1">
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
        autoComplete={name === "name" ? "name" : name === "email" ? "email" : name === "phone" ? "tel" : "address-level2"}
        className="w-full border-b border-primary-foreground/30 bg-transparent py-3 text-base text-primary-foreground placeholder:text-primary-foreground/70 outline-none transition-colors focus:border-gold"
      />
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
      <span className="block border-b border-primary-foreground/30 px-1 py-3 text-center text-xs text-primary-foreground/80 peer-checked:border-gold peer-checked:text-gold peer-focus-visible:outline peer-focus-visible:outline-gold">
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
        <div className="flex flex-col items-center gap-4">
          <a href="#top" aria-label="ingida home"><IngidaLogo className="footer-logo text-navy-deep" /></a>
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
            <a href="#" className="hover:text-foreground">{t.footAdmin}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
