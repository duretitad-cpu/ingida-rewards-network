import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Item = { id: string; name: string; description: string; notes: string; image_path: string; quantity: number; code_prefix: string; created_at: string; quest_reward: boolean };
type Unit = { id: string; item_id: string; code: string; claimed_at: string | null; claim_note: string; assigned_name: string; assigned_phone: string };

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode(prefix: string) {
  const b = crypto.getRandomValues(new Uint8Array(8));
  return `${prefix}-${Array.from(b, (x) => ALPHA[x % 32]).join("")}`;
}

export function parseScannedCode(raw: string) {
  let v = raw.trim();
  if (v.includes("|")) v = v.split("|").pop()!.trim();
  if (/^https?:\/\//i.test(v)) v = v.split(/[/?#=]/).filter(Boolean).pop() ?? v;
  return v.toUpperCase();
}

async function shrinkImage(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 480 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c.toDataURL("image/jpeg", 0.8);
}

function Qr({ value }: { value: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { margin: 1, width: 160 }).then((url) => { if (active) setSrc(url); }).catch(() => { if (active) setSrc(""); });
    return () => { active = false; };
  }, [value]);
  return src ? <img src={src} alt={`QR ${value}`} className="h-24 w-24 bg-white" /> : <div className="h-24 w-24 bg-muted" aria-label="Generating QR code" />;
}

export function Inventory({ isAdmin, userId }: { isAdmin: boolean; userId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    const [i, u] = await Promise.all([
      supabase.from("inventory_items").select("*").order("created_at", { ascending: false }),
      supabase.from("inventory_units").select("id, item_id, code, claimed_at, claim_note, assigned_name, assigned_phone").order("created_at"),
    ]);
    if (i.error || u.error) { setMsg("Could not load inventory. Check operator access and database migrations."); return; }
    setItems((i.data ?? []) as Item[]);
    setUnits((u.data ?? []) as Unit[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const name = String(f.get("name") ?? "").trim();
    const qty = Math.min(1000, Math.max(1, Number(f.get("qty") ?? 0)));
    const prefix = (String(f.get("prefix") ?? "ING").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "ING").slice(0, 8);
    const file = f.get("image") as File | null;
    if (!name) return;
    setBusy(true); setMsg("");
    try {
      const image_path = file?.size ? await shrinkImage(file) : "";
      const { data, error } = await supabase.from("inventory_items").insert({
        name,
        description: String(f.get("description") ?? "").trim(),
        notes: String(f.get("notes") ?? "").trim(),
        image_path,
        quantity: qty,
        code_prefix: prefix,
        created_by: userId,
        quest_reward: f.get("quest") === "on",
      }).select("id").single();
      if (error || !data) { console.error("Inventory item insert failed", error); setMsg("Could not save product. Apply the latest inventory migration and try again."); return; }
      const rows = Array.from({ length: qty }, () => ({ item_id: data.id, code: makeCode(prefix) }));
      const { error: codeError } = await supabase.from("inventory_units").insert(rows);
      if (codeError) { console.error("Inventory code creation failed", codeError); setMsg("Product saved, but codes failed to generate."); }
      else setMsg(`${qty} codes created for ${name}.`);
      form.reset();
      await load();
    } catch (error) {
      console.error("Inventory save failed", error);
      setMsg("Could not save product image or inventory. Please try again.");
    } finally { setBusy(false); }
  };

  const toggleQuest = async (it: Item) => {
    const { error } = await supabase.from("inventory_items").update({ quest_reward: !it.quest_reward }).eq("id", it.id);
    if (error) setMsg("Could not update Quest Prize status.");
    else await load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this item and all its codes?")) return;
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) setMsg("Could not delete the product.");
    else { setMsg("Product and codes deleted."); await load(); }
  };

  const printCodes = async (item: Item) => {
    const list = units.filter((u) => u.item_id === item.id && !u.claimed_at);
    if (!list.length) { setMsg("No available codes to print."); return; }
    try {
      const imgs = await Promise.all(list.map((u) => QRCode.toDataURL(u.code, { margin: 1, width: 200 })));
      const w = window.open("", "_blank");
      if (!w) { setMsg("Allow pop-ups to print inventory codes."); return; }
      w.document.write(`<title>${item.name} codes</title><body style="font-family:sans-serif;display:flex;flex-wrap:wrap;gap:16px">${imgs.map((src, i) => `<div style="text-align:center;font-size:11px"><img src="${src}" width="120"/><br/>${list[i]?.code ?? ""}</div>`).join("")}</body>`);
      w.document.close(); w.print();
    } catch (error) { console.error(error); setMsg("Could not generate printable QR codes."); }
  };

  return (
    <div className="space-y-10">
      <Scanner units={units} items={items} userId={userId} onDone={load} />
      <section>
        <h1 className="font-serif text-3xl">Merch inventory</h1>
        <form onSubmit={add} className="mt-4 grid gap-3 border border-border p-5 md:grid-cols-2">
          <input name="name" required maxLength={80} placeholder="Product name" className="border-b border-border bg-transparent py-2 outline-none focus:border-gold" />
          <input name="qty" type="number" min={1} max={1000} required placeholder="Quantity" className="border-b border-border bg-transparent py-2 outline-none focus:border-gold" />
          <input name="prefix" maxLength={8} placeholder="Code prefix (e.g. STK)" className="border-b border-border bg-transparent py-2 uppercase outline-none focus:border-gold" />
          <label className="flex items-center gap-2 text-sm"><input name="quest" type="checkbox" /> Quest Prize (eligible for All My Ingidas Eat claims)</label>
          <label className="text-sm">Product image<input name="image" type="file" accept="image/*" className="block py-2 text-sm" /></label>
          <textarea name="description" maxLength={1000} placeholder="Product description" className="border-b border-border bg-transparent py-2 outline-none focus:border-gold md:col-span-2" />
          <textarea name="notes" maxLength={500} placeholder="Internal notes" className="border-b border-border bg-transparent py-2 outline-none focus:border-gold md:col-span-2" />
          <Button type="submit" disabled={busy} className="rounded-none md:col-span-2">{busy ? "Saving…" : "Add product & generate codes"}</Button>
          {msg && <p role="status" className="text-sm text-muted-foreground md:col-span-2">{msg}</p>}
        </form>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {items.map((it) => {
            const mine = units.filter((u) => u.item_id === it.id);
            const out = mine.filter((u) => u.claimed_at).length;
            return <li key={it.id} className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                {it.image_path ? <img src={it.image_path} alt={it.name} className="h-20 w-20 object-cover" /> : <div className="h-20 w-20 bg-muted" />}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{it.name}</p>
                  {it.description && <p className="text-sm text-muted-foreground">{it.description}</p>}
                  <p className="text-sm text-muted-foreground">{mine.length - out} in stock · {out} checked out · {mine.length} total</p>
                  {it.notes && <p className="text-xs text-muted-foreground">Notes: {it.notes}</p>}
                </div>
                <Button size="sm" variant="outline" className="rounded-none" onClick={() => setOpen(open === it.id ? null : it.id)}>{open === it.id ? "Hide codes" : "View codes"}</Button>
                <Button size="sm" variant={it.quest_reward ? "default" : "outline"} className="rounded-none" onClick={() => void toggleQuest(it)}>{it.quest_reward ? "Quest Prize ✓" : "Make Quest Prize"}</Button>
                <Button size="sm" variant="outline" className="rounded-none" onClick={() => void printCodes(it)}>Print QR</Button>
                {isAdmin && <Button size="sm" variant="ghost" onClick={() => void remove(it.id)}>Delete</Button>}
              </div>
              {open === it.id && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {mine.map((u) => <div key={u.id} className={`flex flex-col items-center gap-1 border border-border p-2 text-[10px] ${u.claimed_at ? "opacity-40" : ""}`}>
                  <Qr value={u.code} /><span className="font-mono">{u.code}</span><span>{u.claimed_at ? `Out ${new Date(u.claimed_at).toLocaleDateString()}` : u.assigned_name ? `Won by ${u.assigned_name}` : "Available"}</span>
                </div>)}
              </div>}
            </li>;
          })}
          {!items.length && <li className="py-6 text-sm text-muted-foreground">No stock yet.</li>}
        </ul>
      </section>
    </div>
  );
}

function Scanner({ units, items, userId, onDone }: { units: Unit[]; items: Item[]; userId: string; onDone: () => void | Promise<void> }) {
  const [on, setOn] = useState(false);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState("");
  const ref = useRef<{ stop: () => Promise<void> } | null>(null);
  useEffect(() => {
    if (!on) return;
    let cancelled = false;
    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode("inv-reader"); ref.current = scanner;
      scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 220 }, (text) => { setCode(parseScannedCode(text)); setOn(false); }, () => {})
        .catch(() => { setResult("Camera unavailable — type the code instead."); setOn(false); });
    });
    return () => { cancelled = true; ref.current?.stop().catch(() => {}); ref.current = null; };
  }, [on]);
  const unit = code ? units.find((u) => u.code === parseScannedCode(code)) : undefined;
  const item = unit && items.find((i) => i.id === unit.item_id);
  const checkout = async () => {
    if (!unit) return;
    const { error } = await supabase.from("inventory_units").update({ claimed_at: new Date().toISOString(), claimed_by: userId, claim_note: note }).eq("id", unit.id).is("claimed_at", null);
    setResult(error ? "Could not log this item." : `Checked out: ${item?.name} (${unit.code})`);
    if (!error) { setCode(""); setNote(""); await onDone(); }
  };
  return <section className="border border-border p-5">
    <h2 className="font-serif text-2xl">Scan & check out</h2><p className="text-sm text-muted-foreground">Scan a merch QR or a Quest Prize QR, or type the code.</p>
    <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" className="rounded-none" onClick={() => setOn(!on)}>{on ? "Stop camera" : "Open scanner"}</Button><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code" className="border-b border-border bg-transparent px-1 py-2 font-mono uppercase outline-none focus:border-gold" /></div>
    {on && <div id="inv-reader" className="mt-3 max-w-sm" />}
    {code && <div className="mt-4 text-sm">{!unit ? <p>No item found for {parseScannedCode(code)}.</p> : unit.claimed_at ? <p>{item?.name} — already checked out {new Date(unit.claimed_at).toLocaleString()}.</p> : <div className="flex flex-wrap items-center gap-2"><span>{item?.name} · {unit.assigned_name ? `won in Quest by ${unit.assigned_name} (${unit.assigned_phone})` : "available"}</span><input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Who / note" className="border-b border-border bg-transparent py-1 outline-none" /><Button size="sm" className="rounded-none" onClick={() => void checkout()}>Log checkout</Button></div>}</div>}
    {result && <p className="mt-3 text-sm text-muted-foreground">{result}</p>}
  </section>;
}
