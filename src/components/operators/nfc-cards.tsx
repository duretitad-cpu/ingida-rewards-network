import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Card = {
  id: string;
  card_key: string;
  card_name: string;
  owner_name: string;
  owner_title: string;
  owner_phone: string;
  owner_email: string;
  destination_url: string;
  capture_mode: boolean;
  is_active: boolean;
  tap_count: number;
};

type Contact = {
  id: string;
  card_id: string;
  full_name: string;
  phone: string;
  email: string;
  company: string;
  notes: string;
  created_at: string;
};

function CardQr({ value, cardKey }: { value: string; cardKey: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { margin: 1, width: 240 }).then((url) => { if (active) setSrc(url); }).catch(() => { if (active) setSrc(""); });
    return () => { active = false; };
  }, [value]);

  const downloadQr = () => {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `ingida-card-${cardKey}-qr.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {src ? <img src={src} alt={`QR for ${value}`} className="h-28 w-28 bg-white p-1" /> : <div className="h-28 w-28 bg-muted" />}
      {src && <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={downloadQr}>Download QR</Button>}
    </div>
  );
}

function asWebUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function NfcCards({ isAdmin }: { isAdmin: boolean }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [msg, setMsg] = useState("");
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const load = useCallback(async () => {
    const [c, k] = await Promise.all([
      supabase.from("nfc_cards").select("*").order("card_key"),
      supabase.from("nfc_contacts").select("id, card_id, full_name, phone, email, company, notes, created_at").order("created_at", { ascending: false }),
    ]);
    if (c.error || k.error) { setMsg("Could not load NFC cards or contacts."); return; }
    setCards((c.data ?? []) as Card[]);
    setContacts((k.data ?? []) as Contact[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const totalTaps = cards.reduce((s, c) => s + c.tap_count, 0);
  const rate = totalTaps ? Math.round((contacts.length / totalTaps) * 100) : 0;

  const save = async (c: Card) => {
    const { error } = await supabase.from("nfc_cards").update({
      card_name: c.card_name,
      owner_name: c.owner_name,
      owner_title: c.owner_title,
      owner_phone: c.owner_phone,
      owner_email: c.owner_email,
      destination_url: c.destination_url.trim(),
      capture_mode: c.capture_mode,
      is_active: c.is_active,
    }).eq("id", c.id);
    setMsg(error ? "Could not save the card." : `Card ${c.card_key} saved.`);
  };

  const removeCard = async (c: Card) => {
    if (!window.confirm(`Delete card ${c.card_key}? Its link will stop working.`)) return;
    const { error } = await supabase.from("nfc_cards").delete().eq("id", c.id);
    setMsg(error ? "Could not delete the card." : `Card ${c.card_key} deleted.`);
    if (!error) await load();
  };

  const patch = (id: string, value: Partial<Card>) => setCards((list) => list.map((c) => c.id === id ? { ...c, ...value } : c));

  const addCard = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const key = String(new FormData(form).get("key") ?? "").trim().toLowerCase();
    if (!/^[a-z0-9-]{1,40}$/.test(key)) { setMsg("Use letters, numbers and dashes for the card ID."); return; }
    const { error } = await supabase.from("nfc_cards").insert({ card_key: key, card_name: `Card ${key}` });
    setMsg(error ? "That card ID is already taken." : `Card ${key} added.`);
    if (!error) { form.reset(); await load(); }
  };

  const input = "w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-gold";

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-3xl">NFC Smart Cards</h1>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[["Total taps", totalTaps], ["Contacts captured", contacts.length], ["Conversion", `${rate}%`]].map(([l, v]) => (
            <div key={String(l)} className="border border-border p-4">
              <p className="text-xs uppercase text-muted-foreground">{l}</p>
              <p className="mt-1 font-serif text-3xl">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl">Cards</h2>
          <form onSubmit={addCard} className="flex gap-2">
            <input name="key" required placeholder="New card ID e.g. investor-01" maxLength={40} className={input} />
            <Button size="sm" type="submit" className="rounded-none">Add card</Button>
          </form>
        </div>
        {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((c) => {
            const permanent = `${origin}/nfc/${c.card_key}`;
            const destination = asWebUrl(c.destination_url);
            return (
              <article key={c.id} className="space-y-3 border border-border p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-serif text-xl">{c.card_name || `Card ${c.card_key}`}</p>
                  <span className="text-xs text-muted-foreground">{c.tap_count} taps</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <CardQr value={permanent} cardKey={c.card_key} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Permanent Card URL:</p>
                    <code className="block truncate bg-muted px-2 py-1 text-xs">{permanent}</code>
                    <div className="mt-2 flex gap-2">
                      <Button type="button" size="sm" variant="outline" className="rounded-none text-xs" onClick={() => { void navigator.clipboard.writeText(permanent); setMsg("Card URL copied."); }}>Copy URL</Button>
                      <Button type="button" size="sm" variant="outline" className="rounded-none text-xs" asChild>
                        <a href={permanent} target="_blank" rel="noreferrer">Preview Card Page</a>
                      </Button>
                    </div>
                  </div>
                </div>
                <input className={input} value={c.card_name} onChange={(e) => patch(c.id, { card_name: e.target.value })} placeholder="Card label" />
                <input className={input} value={c.destination_url} onChange={(e) => patch(c.id, { destination_url: e.target.value })} placeholder="Destination URL (e.g. https://instagram.com/ingida)" />
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
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="button" size="sm" className="rounded-none" onClick={() => void save(c)}>Save</Button>
                  <Button type="button" size="sm" variant="destructive" className="rounded-none" onClick={() => void removeCard(c)}>Delete card</Button>
                  {destination && (
                    <Button type="button" size="sm" variant="outline" className="rounded-none" asChild>
                      <a href={destination} target="_blank" rel="noreferrer">Preview Link Page</a>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <p className="text-sm text-muted-foreground">Card contacts appear directly in the Invitation CRM tab with source "NFC".</p>
    </div>
  );
}
