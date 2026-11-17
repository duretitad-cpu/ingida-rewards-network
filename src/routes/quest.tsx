import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatEthiopianPhone } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FortuneTeller, type Phase } from "@/components/game/FortuneTeller";
import { Link } from "@tanstack/react-router";
import { IngidaLogo } from "@/components/brand/ingida-logo";
import { Reward, type MerchResult } from "@/components/game/Reward";
import { ROUNDS, type Reveal } from "@/components/game/rounds";

export const Route = createFileRoute("/quest")({
  head: () => ({
    meta: [
      { title: "All My Ingidas Eat — INGIDA Quest" },
      { name: "description", content: "Play the INGIDA paper fortune game, learn how rewards work and claim your merch." },
      { property: "og:title", content: "INGIDA — Unfold your welcome" },
      { property: "og:description", content: "A fast, fun paper game from INGIDA. Play, learn and win merch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Step = "intro" | "play" | "alerts" | "form" | "done" | "bye";

const formSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  phone: z.string().trim()
    .refine((value) => formatEthiopianPhone(value) !== null, "Use an Ethiopian number, e.g. +251 911 234 567")
    .transform((value) => formatEthiopianPhone(value)!),
});

function Index() {
  const [step, setStep] = useState<Step>("play");
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("closed");
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [score, setScore] = useState(0);
  const answers = useRef<Record<string, string>>({});
  const [result, setResult] = useState<MerchResult | null>(null);
  const finished = useRef(false);
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (alertTimer.current) clearTimeout(alertTimer.current); }, []);
  const go = (next: Step) => { if (alertTimer.current) { clearTimeout(alertTimer.current); alertTimer.current = null; } setStep(next); };

  const r = ROUNDS[round] ?? ROUNDS[0];
  if (!r) return null;

  function pinch(times: number, done: () => void) {
    let n = 0;
    const tick = () => {
      n++;
      setPhase(n % 2 ? "h" : "v");
      if (n < times) setTimeout(tick, 420);
      else setTimeout(() => { setPhase("closed"); done(); }, 420);
    };
    tick();
  }

  function onPick(i: number) {
    if (!r || spinning || finished.current) return;
    setPicked(i);
    setSpinning(true);
    answers.current[r.key] = r.labels[i] ?? "";
    pinch(2, () => {
      const rv = r.reveal(i);
      if (rv.correct) setScore((s) => s + 1);
      setReveal(rv);
      setSpinning(false);
      setPicked(null);
      if (round + 1 < ROUNDS.length) setRound(round + 1);
      else { finished.current = true; alertTimer.current = setTimeout(() => { alertTimer.current = null; setStep((s) => (s === "play" ? "alerts" : s)); }, 1800); }
    });
  }

  return (
    <main className="quest-page min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-4 pt-5">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="INGIDA home" className="text-primary"><IngidaLogo className="h-7 w-auto" /></Link>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">#ingidaMoment</span>
        </header>

        {step === "play" && (
          <section className="flex flex-col gap-0 pt-2">
            <div className="space-y-2">
              <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{r.eyebrow}</p>
            </div>
            <div key={round} className="mb-1 mt-5 flex items-center justify-center text-center">
              <h2 className="font-serif text-xl font-semibold leading-[1.12] text-primary sm:text-2xl">
                {r.key === "lifestyle" ? <><span className="block">Tell Us About Your Lifestyle.</span><span className="block text-balance">Where Do You Spend The Most?</span></> : r.prompt}
              </h2>
            </div>
            <div><FortuneTeller labels={r.labels} inside={r.inside} inner={round > 0} phase={phase} disabled={spinning || finished.current} picked={picked} onPick={onPick} /></div>
            <div className="px-2 pt-3" aria-live="polite">
              {reveal ? (
                <div className="text-center">
                  <h3 className="font-serif text-xl font-semibold leading-tight text-primary">{reveal.title}</h3>
                  <p className="mx-auto mt-1 max-w-xs text-sm leading-snug text-muted-foreground">{reveal.body}</p>
                </div>
              ) : null}
            </div>
            <div className="mt-4 flex gap-1 px-8" aria-label={`Progress: question ${round + 1} of ${ROUNDS.length}`}>
              {ROUNDS.map((_, i) => (
                <span key={i} className={`h-[3px] flex-1 transition-colors duration-150 ${i <= round ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>
          </section>
        )}

        {step === "alerts" && (
          <section className="flex flex-1 flex-col justify-center gap-6 py-8 text-center animate-in fade-in duration-500">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Stay In The Loop</p>
            <h2 className="font-serif text-4xl font-semibold capitalize leading-[0.95] text-primary">Would You Like To Receive Alerts?</h2>
            <p className="text-muted-foreground">INGIDA turns everyday spend into rewards across partners. Get launch alerts and a gift.</p>
            <div className="grid gap-3">
              <Button size="lg" className="h-14 rounded-full text-base" onClick={() => go("form")}>Yes, send me alerts</Button>
              <Button size="lg" variant="ghost" className="rounded-full" onClick={() => go("bye")}>No thanks</Button>
            </div>
          </section>
        )}

        {step === "form" && <SignupForm answers={{ ...answers.current, score: String(score) }} onDone={(res) => { setResult(res); go("done"); }} />}
        {step === "done" && result && <Reward result={result} />}

        {step === "bye" && (
          <section className="flex flex-1 flex-col justify-center gap-6 py-8 text-center">
            <h2 className="font-serif text-4xl font-semibold capitalize leading-[0.95] text-primary">Thanks for playing.</h2>
            <p className="text-muted-foreground">Changed your mind? Alerts come with free merch.</p>
            <Button size="lg" className="h-14 rounded-full" onClick={() => go("form")}>Sign me up</Button>
          </section>
        )}

        <footer className="pt-3 text-center text-[11px] text-muted-foreground">Made in Addis Ababa · ingida.com</footer>
      </div>
    </main>
  );
}

function SignupForm({ answers, onDone }: { answers: Record<string, string>; onDone: (r: MerchResult) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = formSchema.safeParse({ name, phone });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);

    try {
      const { data, error } = await supabase.rpc("claim_quest_prize", {
        _name: parsed.data.name,
        _phone: parsed.data.phone,
        _answers: answers,
      });

      if (error) {
        toast.error("We couldn't save your signup. Please check your number and try again.");
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      onDone({ code: row?.code ?? null, item: row?.item ?? null, description: row?.description ?? null, image: row?.image || null, already: !!row?.already });
    } catch {
      toast.error("We couldn't save your signup. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col justify-center gap-5 py-8 animate-in fade-in duration-500">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Last fold</p>
        <h2 className="font-serif text-3xl font-semibold capitalize leading-[0.95] text-primary">Where should we send your alerts?</h2>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" className="h-12 bg-card" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" required />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" className="h-12 bg-card" type="tel" inputMode="tel" placeholder="+251 9…" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} autoComplete="tel" required />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>
      <Button type="submit" size="lg" className="h-14 rounded-full text-base" disabled={busy}>
        {busy ? "Unfolding your code…" : "Reveal my merch code"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">One code per phone number.</p>
    </form>
  );
}
