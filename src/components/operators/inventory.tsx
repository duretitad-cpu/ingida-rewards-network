import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Item = {
  id: string;
  name: string;
  description: string;
  notes: string;
  image_path: string;
  quantity: number;
  code_prefix: string;
  created_at: string;
  quest_reward: boolean;
  sticker_title: string;
  sticker_hashtag: string;
};

type Unit = {
  id: string;
  item_id: string;
  code: string;
  claimed_at: string | null;
  claim_note: string;
  assigned_name: string;
  assigned_phone: string;
};

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode(prefix: string) {
  const b = crypto.getRandomValues(new Uint8Array(8));
  return `${prefix}-${Array.from(b, (x) => ALPHA[x % 32]).join("")}`;
}

export function parseScannedCode(raw: string) {
  let value = raw.trim();
  if (value.includes("|")) value = value.split("|").pop()?.trim() ?? value;
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const queryCode = url.searchParams.get("code") ?? url.searchParams.get("redeem");
      value = queryCode ?? url.pathname.split("/").filter(Boolean).pop() ?? value;
    } catch {
      // keep raw string if URL parse fails
    }
  }
  return value.trim().toUpperCase();
}

async function shrinkImage(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 480 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function Qr({ value }: { value: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { margin: 1, width: 160 })
      .then((url) => { if (active) setSrc(url); })
      .catch(() => { if (active) setSrc(""); });
    return () => { active = false; };
  }, [value]);
  return src ? <img src={src} alt={`QR ${value}`} className="h-24 w-24 bg-white" /> : <div className="h-24 w-24 bg-muted" />;
}

export function Inventory({ isAdmin, userId }: { isAdmin: boolean; userId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [itemResult, unitResult] = await Promise.all([
      supabase.from("inventory_items").select("*").order("created_at", { ascending: false }),
      supabase.from("inventory_units").select("id, item_id, code, claimed_at, claim_note, assigned_name, assigned_phone").order("created_at"),
    ]);
    if (itemResult.error || unitResult.error) {
      setMsg("Could not load inventory.");
      return;
    }
    setItems((itemResult.data ?? []) as Item[]);
    setUnits((unitResult.data ?? []) as Unit[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") ?? "").trim();
    const quantity = Math.min(1000, Math.max(1, Number(values.get("qty") ?? 0)));
    const prefix = (String(values.get("prefix") ?? "ING").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "ING").slice(0, 8);
    const description = String(values.get("description") ?? "").trim();
    const notes = String(values.get("notes") ?? "").trim();
    const imageFile = values.get("image") as File | null;
    if (!name) return;

    setBusy(true);
    setMsg("");
    try {
      const image_path = imageFile?.size ? await shrinkImage(imageFile) : "";
      const { data, error } = await supabase.from("inventory_items").insert({
        name,
        description,
        notes,
        image_path,
        quantity,
        code_prefix: prefix,
        created_by: userId,
        quest_reward: values.get("quest") === "on",
      }).select("id").single();

      if (error || !data) {
        setMsg("Could not save product. Please check your inputs.");
        return;
      }

      const codeRows = Array.from({ length: quantity }, () => ({ item_id: data.id, code: makeCode(prefix) }));
      const { error: codeError } = await supabase.from("inventory_units").insert(codeRows);
      if (codeError) {
        setMsg("Product saved, but codes failed to generate.");
      } else {
        setMsg(`${quantity} codes generated for ${name}.`);
      }
      form.reset();
      await load();
    } catch {
      setMsg("Could not save product image or inventory.");
    } finally {
      setBusy(false);
    }
  };

  const saveSticker = async (item: Item, patch: Partial<Pick<Item, "sticker_title" | "sticker_hashtag">>) => {
    const { error } = await supabase.from("inventory_items").update(patch).eq("id", item.id);
    setMsg(error ? "Could not save sticker text." : "Sticker text saved.");
    if (!error) await load();
  };

  const toggleQuest = async (item: Item) => {
    const { error } = await supabase.from("inventory_items").update({ quest_reward: !item.quest_reward }).eq("id", item.id);
    if (error) setMsg("Could not update Quest Prize status.");
    else await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this item and all its codes?")) return;
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) setMsg("Could not delete the product.");
    else { setMsg("Product and codes deleted."); await load(); }
  };

  const printCodes = async (item: Item) => {
    const availableUnits = units.filter((u) => u.item_id === item.id && !u.claimed_at);
    if (!availableUnits.length) { setMsg("No available codes to print."); return; }
    try {
      const images = await Promise.all(availableUnits.map((u) => QRCode.toDataURL(u.code, { margin: 1, width: 200 })));
      const win = window.open("", "_blank");
      if (!win) { setMsg("Allow pop-ups to print inventory codes."); return; }
      const h = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
      win.document.write(`<title>${h(item.name)} codes</title><body style="font-family:sans-serif;display:flex;flex-wrap:wrap;gap:16px">${images.map((src, i) => `<div style="text-align:center;font-size:11px"><img src="${src}" width="120"/><br/>${h(availableUnits[i]?.code ?? "")}</div>`).join("")}</body>`);
      win.document.close();
      win.print();
    } catch {
      setMsg("Could not generate printable QR codes.");
    }
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
          <label className="flex items-center gap-2 text-sm"><input name="quest" type="checkbox" /> Quest Prize (given out in Unfold Your Welcome)</label>
          <label className="text-sm md:col-span-2">Product image<input name="image" type="file" accept="image/*" className="block py-2 text-sm" /></label>
          <textarea name="description" maxLength={1000} placeholder="Product description (shown to winners)" className="border-b border-border bg-transparent py-2 outline-none focus:border-gold md:col-span-2" />
          <textarea name="notes" maxLength={500} placeholder="Internal notes" className="border-b border-border bg-transparent py-2 outline-none focus:border-gold md:col-span-2" />
          <Button type="submit" disabled={busy} className="rounded-none md:col-span-2">{busy ? "Saving…" : "Add product & generate codes"}</Button>
          {msg && <p role="status" className="text-sm text-muted-foreground md:col-span-2">{msg}</p>}
        </form>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {items.map((item) => {
            const itemUnits = units.filter((u) => u.item_id === item.id);
            const checkedOut = itemUnits.filter((u) => u.claimed_at).length;
            return (
              <li key={item.id} className="py-4">
                <div className="flex flex-wrap items-center gap-4">
                  {item.image_path ? <img src={item.image_path} alt={item.name} className="h-20 w-20 object-cover" /> : <div className="h-20 w-20 bg-muted" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    <p className="text-sm text-muted-foreground">{itemUnits.length - checkedOut} in stock · {checkedOut} checked out · {itemUnits.length} total</p>
                    {item.notes && <p className="text-xs text-muted-foreground">Notes: {item.notes}</p>}
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <label className="text-xs text-muted-foreground">IG sticker title
                        <input defaultValue={item.sticker_title} maxLength={60} onBlur={(e) => { if (e.target.value !== item.sticker_title) void saveSticker(item, { sticker_title: e.target.value.trim() }); }} className="block w-full border-b border-border bg-transparent py-1 text-sm text-foreground outline-none focus:border-gold" />
                      </label>
                      <label className="text-xs text-muted-foreground">IG sticker hashtag
                        <input defaultValue={item.sticker_hashtag} maxLength={40} onBlur={(e) => { if (e.target.value !== item.sticker_hashtag) void saveSticker(item, { sticker_hashtag: e.target.value.trim() }); }} className="block w-full border-b border-border bg-transparent py-1 text-sm text-foreground outline-none focus:border-gold" />
                      </label>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-none" onClick={() => setOpen(open === item.id ? null : item.id)}>{open === item.id ? "Hide codes" : "View codes"}</Button>
                  <Button size="sm" variant={item.quest_reward ? "default" : "outline"} className="rounded-none" onClick={() => void toggleQuest(item)}>{item.quest_reward ? "Quest Prize ✓" : "Make Quest Prize"}</Button>
                  <Button size="sm" variant="outline" className="rounded-none" onClick={() => void printCodes(item)}>Print QR</Button>
                  {isAdmin && <Button size="sm" variant="ghost" onClick={() => void remove(item.id)}>Delete</Button>}
                </div>
                {open === item.id && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                    {itemUnits.map((u) => (
                      <div key={u.id} className={`flex flex-col items-center gap-1 border border-border p-2 text-[10px] ${u.claimed_at ? "opacity-40" : ""}`}>
                        <Qr value={u.code} />
                        <span className="font-mono">{u.code}</span>
                        <span>{u.claimed_at ? `Out ${new Date(u.claimed_at).toLocaleDateString()}` : u.assigned_name ? `Won by ${u.assigned_name}` : "Available"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
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
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (!on) return;
    let cancelled = false;
    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode("inv-reader");
      scannerRef.current = scanner;
      scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 220 }, (text) => {
        setCode(parseScannedCode(text));
        setResult("QR scanned. Confirm redemption below.");
        setOn(false);
      }, () => {}).catch(() => {
        setResult("Camera unavailable — enter code manually.");
        setOn(false);
      });
    }).catch(() => {
      setResult("Scanner unavailable.");
      setOn(false);
    });
    return () => { cancelled = true; scannerRef.current?.stop().catch(() => {}); scannerRef.current = null; };
  }, [on]);

  const normalizedCode = code ? parseScannedCode(code) : "";
  const unit = normalizedCode ? units.find((u) => u.code.toUpperCase() === normalizedCode) : undefined;
  const item = unit && items.find((i) => i.id === unit.item_id);

  const redeem = async () => {
    if (!unit || unit.claimed_at || busy) return;
    setBusy(true);
    setResult("");
    const { data, error } = await supabase.from("inventory_units")
      .update({ claimed_at: new Date().toISOString(), claimed_by: userId, claim_note: note.trim() })
      .eq("id", unit.id)
      .is("claimed_at", null)
      .select("id")
      .maybeSingle();
    setBusy(false);
    if (error || !data) {
      setResult("Could not confirm redemption or code already redeemed.");
      return;
    }
    setResult(`Redeemed: ${item?.name ?? "merch"} (${unit.code}).`);
    setCode("");
    setNote("");
    await onDone();
  };

  return (
    <section className="border border-border p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Redemption scanner</h2>
        <Button size="sm" variant={on ? "default" : "outline"} className="rounded-none" onClick={() => setOn(!on)}>{on ? "Close camera" : "Open camera"}</Button>
      </div>
      {on && <div id="inv-reader" className="mx-auto mt-4 max-w-sm border border-border" />}
      <div className="mt-4 flex flex-wrap gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Scan or enter code" className="flex-1 border-b border-border bg-transparent py-2 uppercase outline-none focus:border-gold" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Claim note (e.g. Host John)" className="flex-1 border-b border-border bg-transparent py-2 outline-none focus:border-gold" />
        <Button size="sm" disabled={!unit || !!unit.claimed_at || busy} className="rounded-none" onClick={() => void redeem()}>{busy ? "Redeeming…" : "Log checkout"}</Button>
      </div>
      {unit && (
        <p className="mt-2 text-sm text-muted-foreground">
          {item?.name} — {unit.claimed_at ? `Already redeemed on ${new Date(unit.claimed_at).toLocaleDateString()}` : unit.assigned_name ? `Won in Quest by ${unit.assigned_name} (${unit.assigned_phone})` : "Available in stock"}
        </p>
      )}
      {result && <p role="status" className="mt-2 text-sm font-medium">{result}</p>}
    </section>
  );
}
