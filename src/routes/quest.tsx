import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { questSchema } from "@/lib/quest-schema";
import { questCopy } from "@/lib/quest-copy";
import { getQuestMode } from "@/lib/quest-mode.functions";
import { questCompletion } from "@/lib/quest-mode";
import { Thanks } from "@/components/game/Thanks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FortuneTeller, type Phase } from "@/components/game/FortuneTeller";
import { Link } from "@tanstack/react-router";
import { IngidaLogo } from "@/components/brand/ingida-logo";
import { Reward, type MerchResult } from "@/components/game/Reward";
import { ROUNDS as EN_ROUNDS, AM_ROUNDS, type Reveal } from "@/components/game/rounds";

const modeOptions = queryOptions({ queryKey: ["quest-mode"], queryFn: () => getQuestMode(), staleTime: 0 });

export const Route = createFileRoute("/quest")({
  loader: ({ context }) => context.queryClient.ensureQueryData(modeOptions),
  head: () => ({
    meta: [
      { title: "Unfold Your Welcome — INGIDA Quest" },
      { name: "description", content: "Play the INGIDA paper fortune game in English or Amharic and join our hospitality network." },
      { property: "og:title", content: "INGIDA — Unfold your welcome" },
      { property: "og:description", content: "Unfold your welcome with INGIDA. Play in English or Amharic and stay connected." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { lang?: "en" | "am" } =>
    search["lang"] === "am" ? { lang: "am" } : search["lang"] === "en" ? { lang: "en" } : {},
  component: Index,
});

type Step = "play" | "form" | "done" | "bye";

function Index() {
  const { lang } = Route.useSearch();
  const am = lang === "am";
  const t = questCopy[am ? "am" : "en"];
  const { data: rewardsEnabled } = useSuspenseQuery(modeOptions);
  const ROUNDS = am ? AM_ROUNDS : EN_ROUNDS;
  const [step, setStep] = useState<Step>("play");
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("closed");
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [iconIndex, setIconIndex] = useState(0);
  const [category, setCategory] = useState(0);
  const answers = useRef<Record<string, string>>({});
  const [result, setResult] = useState<MerchResult | null>(null);
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const picking = useRef(false);
  useEffect(() => () => { if (animationTimer.current) clearTimeout(animationTimer.current); }, []);
  const go = (next: Step) => setStep(next);

  const base = ROUNDS[round] ?? ROUNDS[0];
  if (!base) return null;
  const catName = ROUNDS[0]?.labels[category] ?? "";
  const r = { ...base, labels: base.labelsByCategory?.[category] ?? base.labels };

  function pinch(times: number, done: () => void) {
    let n = 0;
    const tick = () => {
      n++;
      setPhase(n % 2 ? "h" : "v");
      setIconIndex((i) => i + 1);
      if (n < times) animationTimer.current = setTimeout(tick, 420);
      else animationTimer.current = setTimeout(() => { setPhase("closed"); picking.current = false; done(); }, 420);
    };
    tick();
  }

  function onPick(i: number) {
    if (spinning || picking.current) return;
    picking.current = true;
    setPicked(i);
    setSpinning(true);
    answers.current[r.key] = r.labels[i] ?? "";
    if (r.key === "alerts") {
      const yes = i === 0 || i === 2;
      answers.current["wants_alerts"] = String(yes);
      pinch(2, () => { setSpinning(false); go(yes ? "form" : "bye"); });
      return;
    }
    if (round === 0) setCategory(i);
    pinch(2, () => {
      const rv = r.reveal(i);
      setReveal(rv);
      setSpinning(false);
      setPicked(null);
      if (round + 1 < ROUNDS.length) setRound(round + 1);
    });
  }

  return (
    <main lang={am ? "am" : "en"} className="quest-page min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-4 pt-5">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label={t.home} className="text-primary">{am ? <img src="/ingidaama.png" alt="እንግዳ" className="h-7 w-auto" /> : <IngidaLogo className="h-7 w-auto" />}</Link>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">#MyingidaMoment</span>
        </header>

        {step === "play" && (
          <section className="flex flex-1 flex-col gap-0 pt-2">
            <div className="space-y-2">
              <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{r.eyebrow}</p>
            </div>
            <div key={round} className="mb-1 mt-5 flex items-center justify-center text-center">
              <h2 className="font-serif text-xl font-normal leading-[1.12] text-primary sm:text-2xl">
                {r.key === "lifestyle" && !am ? <><span className="block">Tell Us About Your Lifestyle.</span><span className="block text-balance">Where Do You Spend The Most?</span></> : r.parts ? <>{r.parts[0].replace("{cat}", catName)}<em className="italic text-gold">{r.parts[1]}</em>{r.parts[2].replace("{cat}", catName)}</> : r.prompt.replace("{cat}", catName)}
              </h2>
            </div>
            <div><FortuneTeller am={am} labels={r.labels} inside={r.inside} inner={round > 0} phase={phase} iconIndex={iconIndex} disabled={spinning} picked={picked} onPick={onPick} /></div>
            <div className="px-2 pt-3" aria-live="polite">
              {reveal ? (
                <div className="text-center">
                  <h3 className="font-serif text-xl font-normal leading-tight text-primary">{reveal.title}</h3>
                  <p className="mx-auto mt-1 max-w-xs text-sm leading-snug text-muted-foreground">{reveal.body}</p>
                </div>
              ) : null}
            </div>
            <div className="mt-auto flex gap-1 px-8 pt-5" aria-label={`${t.progress}: ${t.question} ${round + 1} ${t.of} ${ROUNDS.length}`}>
              {ROUNDS.map((_, i) => (
                <span key={i} className={`h-[3px] flex-1 transition-colors duration-150 ${i <= round ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>
          </section>
        )}

        {step === "form" && <SignupForm am={am} rewardsEnabled={rewardsEnabled} answers={answers.current} onDone={(res) => { setResult(res); go("done"); }} />}
        {step === "done" && result && (questCompletion(result.rewardsEnabled ?? rewardsEnabled) === "thanks" ? <Thanks am={am} /> : <Reward am={am} result={result} />)}

        {step === "bye" && (
          <section className="flex flex-1 flex-col justify-center gap-6 py-8 text-center">
            <h2 className="font-serif text-4xl font-normal leading-[0.95] text-primary">{t.bye}</h2>
            <p className="text-muted-foreground">{t.changed}</p>
            <Button size="lg" className="h-14 rounded-full" onClick={() => { answers.current["wants_alerts"] = "true"; go("form"); }}>{t.submit}</Button>
          </section>
        )}

        <footer className="pt-3 text-center text-[11px] text-muted-foreground">{t.made} · ingida.com</footer>
      </div>
    </main>
  );
}

function SignupForm({ answers, onDone, am, rewardsEnabled }: { answers: Record<string, string>; onDone: (r: MerchResult) => void; am: boolean; rewardsEnabled: boolean }) {
  const t = questCopy[am ? "am" : "en"];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = questSchema.safeParse({ name, phone });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.path[0] === "name" ? t.nameError : t.phoneError])));
      return;
    }
    setErrors({});
    setBusy(true);

    try {
      const { data, error } = await supabase.rpc("submit_quest_signup", {
        _name: parsed.data.name,
        _phone: parsed.data.phone,
        _answers: answers,
      });

      if (error) {
        toast.error(t.saveError);
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) { toast.error(t.saveError); return; }
      onDone({ code: row.code, item: row.item, description: row.description, image: row.image || null, already: !!row.already, rewardsEnabled: row.rewards_enabled });
    } catch {
      toast.error(t.connectionError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col justify-center gap-5 py-8 animate-in fade-in duration-500">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.last}</p>
        <h2 className="font-serif text-3xl font-normal leading-tight text-primary">{t.signup}</h2>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{t.name}</Label>
        <Input id="name" className="h-12 bg-card" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" required />
        {errors["name"] && <p className="text-sm text-destructive">{errors["name"]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t.phone}</Label>
        <Input id="phone" className="h-12 bg-card" type="tel" inputMode="tel" placeholder="+251 9…" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} autoComplete="tel" required />
        {errors["phone"] && <p className="text-sm text-destructive">{errors["phone"]}</p>}
      </div>
      <Button type="submit" size="lg" className="h-14 rounded-full text-base" disabled={busy}>
        {busy ? t.saving : rewardsEnabled ? t.claim : t.submit}
      </Button>
      {rewardsEnabled && <p className="text-center text-xs text-muted-foreground">{t.one}</p>}
    </form>
  );
}
