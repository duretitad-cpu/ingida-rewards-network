import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Card = { id: string; card_key: string; card_name: string; owner_name: string; owner_title: string; owner_phone: string; owner_email: string; destination_url: string; capture_mode: boolean; is_active: boolean; tap_count: number };
type Contact = { id: string; card_id: string; full_name: string; phone: string; email: string; company: string; notes: string; created_at: string };

export function NfcCards({ isAdmin }: { isAdmin: boolean }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [cardFilter, setCardFilter] = useState("all");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const load = useCallback(async () => {
    const [c, k] = await Promise.all([
      supabase.from("nfc_cards").select("*").order("card_key"),
      supabase.from("nfc_contacts").select("id, card_id, full_name, phone, email, company, notes, created_at").order("created_at", { ascending: false }),
    ]);
    setCards((c.data ?? []) as Card[]);
    setContacts((k.data ?? []) as Contact[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const totalTaps = cards.reduce((s, c) => s + c.tap_count, 0);
  const rate = totalTaps ? Math.round((contacts.length / totalTaps) * 100) : 0;
  const nameOf = (id: string) => cards.find((c) => c.id === id)?.card_key ?? "";
  const shown = useMemo(() => contacts.filter((r) => (cardFilter === "all" || r.card_id === cardFilter) &&
    (!q || `${r.full_name} ${r.email} ${r.phone} ${r.company}`.toLowerCase().includes(q.toLowerCase()))), [contacts, cardFilter, q]);

  const save = async (c: Card) => {
    const { error } = await supabase.from("nfc_cards").update({
      card_name: c.card_name, owner_name: c.owner_name, owner_title: c.owner_title, owner_phone: c.owner_phone,
      owner_email: c.owner_email, destination_url: c.destination_url.trim(), capture_mode: c.capture_mode, is_active: c.is_active,
    }).eq("id", c.id);
    setMsg(error ? "Could not save the card." : `Card ${c.card_key} saved.`);
  };
  const patch = (id: string, p: Partial<Card>) => setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)));

  const addCard = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const key = String(new FormData(form).get("key") ?? "").trim().toLowerCase();
    if (!/^[a-z0-9-]{1,40}$/.test(key)) { setMsg("Use letters, numbers and dashes for the card ID."); return; }
    const { error } = await supabase.from("nfc_cards").insert({ card_key: key, card_name: `Card ${key}` });
    setMsg(error ? "That card ID is already taken." : `Card ${key} added.`);
    if (!error) { form.reset(); load(); }
  };

  const exportCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const head = ["Date", "Card", "Name", "Phone", "Email", "Company", "Notes"];
    const lines = shown.map((r) => [new Date(r.created_at).toISOString(), nameOf(r.card_id), r.full_name, r.phone, r.email, r.company, r.notes].map((v) => esc(String(v))).join(","));
    const url = URL.createObjectURL(new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "ingida-nfc-contacts.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const input = "w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-gold";

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-3xl">NFC Smart Cards</h1>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[["Total taps", totalTaps], ["Contacts captured", contacts.length], ["Conversion", `${rate}%`]].map(([l, v]) => (
            <div key={String(l)} className="border border-border p-4"><p className="text-xs uppercase text-muted-foreground">{l}</p><p className="mt-1 font-serif text-3xl">{v}</p></div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl">Cards</h2>
          <form onSubmit={addCard} className="flex gap-2">
            <input name="key" placeholder="New card ID e.g. investor-01" maxLength={40} className={input} />
            <Button size="sm" type="submit" className="rounded-none">Add card</Button>
          </form>
        </div>
        {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((c) => {
            const permanent = `${origin}/nfc/${c.card_key}`;
            return (
              <div key={c.id} className="space-y-2 border border-border p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-serif text-xl">Card {c.card_key}</p>
                  <span className="text-xs text-muted-foreground">{c.tap_count} taps</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <code className="truncate bg-muted px-2 py-1">{permanent}</code>
                  <Button size="sm" variant="outline" className="rounded-none" onClick={() => { navigator.clipboard.writeText(permanent); setMsg("Chip URL copied."); }}>Copy</Button>
                </div>
                <input className={input} value={c.card_name} onChange={(e) => patch(c.id, { card_name: e.target.value })} placeholder="Card label" />
                <input className={input} value={c.destination_url} onChange={(e) => patch(c.id, { destination_url: e.target.value })} placeholder="Destination URL" />
                <div className="grid grid-cols-2 gap-x-3">
                  <input className={input} value={c.owner_name} onChange={(e) => patch(c.id, { owner_name: e.target.value })} placeholder="Owner name" />
                  <input className={input} value={c.owner_title} onChange={(e) => patch(c.id, { owner_title: e.target.value })} placeholder="Owner title" />
                  <input className={input} value={c.owner_phone} onChange={(e) => patch(c.id, { owner_phone: e.target.value })} placeholder="Owner phone" />
                  <input className={input} value={c.owner_email} onChange={(e) => patch(c.id, { owner_email: e.target.value })} placeholder="Owner email" />
                </div>
                <div className="flex flex-wrap gap-4 pt-2 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={c.capture_mode} onChange={(e) => patch(c.id, { capture_mode: e.target.checked })} /> Lead capture mode</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={c.is_active} onChange={(e) => patch(c.id, { is_active: e.target.checked })} /> Active</label>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="rounded-none" onClick={() => save(c)}>Save</Button>
                  <Button size="sm" variant="outline" className="rounded-none" asChild><a href={`/nfc/${c.card_key}`} target="_blank" rel="noreferrer">Preview</a></Button>
                  {isAdmin && null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl">Contacts</h2>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className={input + " w-40"} />
            <select value={cardFilter} onChange={(e) => setCardFilter(e.target.value)} className="border border-border bg-background px-2 text-sm">
              <option value="all">All cards</option>
              {cards.map((c) => <option key={c.id} value={c.id}>Card {c.card_key}</option>)}
            </select>
            <Button size="sm" variant="outline" className="rounded-none" onClick={exportCsv}>Export CSV</Button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr><th className="py-2">Date</th><th>Card</th><th>Name</th><th>Phone</th><th>Email</th><th>Company</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top">
                  <td className="py-3 pr-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="pr-3 py-3">{nameOf(r.card_id)}</td>
                  <td className="pr-3 py-3">{r.full_name}</td>
                  <td className="pr-3 py-3">{r.phone}</td>
                  <td className="pr-3 py-3">{r.email}</td>
                  <td className="pr-3 py-3">{r.company}</td>
                  <td className="pr-3 py-3">{r.notes}</td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={7} className="py-6 text-muted-foreground">No contacts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
