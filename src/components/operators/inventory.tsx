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

/** Normalize inventory codes from QR contents, plain text, or URLs containing a code. */
export function parseScannedCode(raw: string) {
  let value = raw.trim();
  if (value.includes("|")) value = value.split("|").pop()?.trim() ?? value;
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const queryCode = url.searchParams.get("code") ?? url.searchParams.get("redeem");
      value = queryCode ?? url.pathname.split("/").filter(Boolean).pop() ?? value;
    } catch {
      // Keep the original text if a scanner provides a malformed URL.
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
  return canvas.toDataURL("image/jpeg", 0.8);
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
  return src ? <img src={src} alt={`QR ${value}`} className="h-24 w-24 bg-white" /> : <div className="h-24 w-24 bg-muted" aria-label="Generating QR code" />;
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
      setMsg("Could not load inventory. Check operator access and database migrations.");
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
    const imageFile = values.get("image") as File | null;
    if (!name) return;

    setBusy(true);
    setMsg("");
    try {
      const image_path = imageFile?.size ? await shrinkImage(imageFile) : "";
      const { data, error } = await supabase.from("inventory_items").insert({
        name,
        description: String(values.get("description") ?? "").trim(),
        notes: String(values.get("notes") ?? "").trim(),
        image_path,
        quantity,
        code_prefix: prefix,
        created_by: userId,
        quest_reward: values.get("quest") === "on",
      }).select("id").single();
      if (error || !data) {
        console.error("Inventory product insert failed", error);
        setMsg("Could not save product. Confirm the latest inventory migration has been applied.");
        return;
      }

      const codeRows = Array.from({ length: quantity }, () => ({ item_id: data.id, code: makeCode(prefix) }));
      const { error: codeError } = await supabase.from("inventory_units").insert(codeRows);
      if (codeError) {
        console.error("Inventory code creation failed", codeError);
        setMsg("Product saved, but codes failed to generate.");
      } else {
        setMsg(`${quantity} codes created for ${name}.`);
      }
      form.reset();
      await load();
    } catch (error) {
      console.error("Inventory save failed", error);
      setMsg("Could not save product image or inventory. Please try again.");
    } finally {
      setBusy(false);
    }
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
    const availableUnits = units.filter((unit) => unit.item_id === item.id && !unit.claimed_at);
    if (!availableUnits.length) { setMsg("No available codes to print."); return; }
    try {
      const images = await Promise.all(availableUnits.map((unit) => QRCode.toDataURL(unit.code, { margin: 1, width: 200 })));
      const printWindow = window.open("", "_blank");
      if (!printWindow) { setMsg("Allow pop-ups to print inventory codes."); return; }
      printWindow.document.write(`<title>${item.name} codes</title><body style="font-family:sans-serif;display:flex;flex-wrap:wrap;gap:16px">${images.map((src, index) => `<div style="text-align:center;font-size:11px"><img src="${src}" width="120"/><br/>${availableUnits[index]?.code ?? ""}</div>`).join("")}</body>`);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Could not create printable inventory QR codes", error);
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
          <label className="flex items-center gap-2 text-sm"><input name="quest" type="checkbox" /> Quest Prize (eligible for All My Ingidas Eat claims)</label>
          <label className="text-sm">Product image<input name="image" type="file" accept="image/*" className="block py-2 text-sm" /></label>
          <textarea name="description" maxLength={1000} placeholder="Product description" className="border-b border-border bg-transparent py-2 outline-none focus:border-gold md:col-span-2" />
          <textarea name="notes" maxLength={500} placeholder="Internal notes" className="border-b border-border bg-transparent py-2 outline-none focus:border-gold md:col-span-2" />
          <Button type="submit" disabled={busy} className="rounded-none md:col-span-2">{busy ? "Saving…" : "Add product & generate codes"}</Button>
          {msg && <p role="status" className="text-sm text-muted-foreground md:col-span-2">{msg}</p>}
        </form>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {items.map((item) => {
            const itemUnits = units.filter((unit) => unit.item_id === item.id);
            const checkedOut = itemUnits.filter((unit) => unit.claimed_at).length;
            return (
              <li key={item.id} className="py-4">
                <div className="flex flex-wrap items-center gap-4">
                  {item.image_path ? <img src={item.image_path} alt={item.name} className="h-20 w-20 object-cover" /> : <div className="h-20 w-20 bg-muted" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    <p className="text-sm text-muted-foreground">{itemUnits.length - checkedOut} in stock · {checkedOut} checked out · {itemUnits.length} total</p>
                    {item.notes && <p className="text-xs text-muted-foreground">Notes: {item.notes}</p>}
                  </div>
                  <Button size="sm" variant="outline" className="rounded-none" onClick={() => setOpen(open === item.id ? null : item.id)}>{open === item.id ? "Hide codes" : "View codes"}</Button>
                  <Button size="sm" variant={item.quest_reward ? "default" : "outline"} className="rounded-none" onClick={() => void toggleQuest(item)}>{item.quest_reward ? "Quest Prize ✓" : "Make Quest Prize"}</Button>
                  <Button size="sm" variant="outline" className="rounded-none" onClick={() => void printCodes(item)}>Print QR</Button>
                  {isAdmin && <Button size="sm" variant="ghost" onClick={() => void remove(item.id)}>Delete</Button>}
                </div>
                {open === item.id && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {itemUnits.map((unit) => <div key={unit.id} className={`flex flex-col items-center gap-1 border border-border p-2 text-[10px] ${unit.claimed_at ? "opacity-40" : ""}`}>
                    <Qr value={unit.code} /><span className="font-mono">{unit.code}</span><span>{unit.claimed_at ? `Out ${new Date(unit.claimed_at).toLocaleDateString()}` : unit.assigned_name ? `Won by ${unit.assigned_name}` : "Available"}</span>
                  </div>)}
                </div>}
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
        setResult("QR scanned. Verify the reward details, then confirm redemption below.");
        setOn(false);
      }, () => {}).catch((error) => {
        console.error("Inventory QR scanner failed", error);
        setResult("Camera unavailable — type the code instead.");
        setOn(false);
      });
    }).catch((error) => {
      console.error("Could not load QR scanner", error);
      setResult("Scanner unavailable — type the code instead.");
      setOn(false);
    });
    return () => { cancelled = true; scannerRef.current?.stop().catch(() => {}); scannerRef.current = null; };
  }, [on]);

  const normalizedCode = code ? parseScannedCode(code) : "";
  const unit = normalizedCode ? units.find((entry) => entry.code.toUpperCase() === normalizedCode) : undefined;
  const item = unit && items.find((entry) => entry.id === unit.item_id);

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
    if (error) {
      console.error("Inventory redemption confirmation failed", error);
      setResult("Could not confirm redemption. Check operator access and try again.");
      return;
    }
    if (!data) {
      setResult("This code was already redeemed. Refreshing inventory…");
      await onDone();
      return;
    }
    setResult(`Redemption confirmed: ${item?.name ?? "merch"} (${unit.code}).`);
    setCode("");
    setNote("");
    await onDone();
  };

  return (
    <section className="border border-border p-5">
      <h2 className="font-serif text-2xl">Confirm redemption</h2>
      <p className="text-sm text-muted-foreground">Scan the All My Ingidas Eat redemption QR, verify the assigned Quest Prize and winner, then confirm checkout.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" className="rounded-none" onClick={() => setOn((value) => !value)}>{on ? "Stop camera" : "Scan redemption QR"}</Button>
        <input aria-label="Redemption code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Or enter code" className="border-b border-border bg-transparent px-1 py-2 font-mono uppercase outline-none focus:border-gold" />
      </div>
      {on && <div id="inv-reader" className="mt-3 max-w-sm" />}
      {code && <div className="mt-4 border border-border p-3 text-sm">
        {!unit ? <p>No inventory code found for {normalizedCode}.</p> : unit.claimed_at ? <p role="status">{item?.name ?? "Quest Prize"} — already redeemed {new Date(unit.claimed_at).toLocaleString()}.</p> : (
          <div className="space-y-2">
            <p className="font-medium">{item?.name ?? "Quest Prize"}</p>
            {item?.description && <p className="text-muted-foreground">{item.description}</p>}
            <p>{unit.assigned_name ? `Quest Prize assigned to ${unit.assigned_name} (${unit.assigned_phone}).` : "This is an unassigned inventory code."}</p>
            <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={200} placeholder="Checkout note (optional)" className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-gold" />
            <Button size="sm" className="rounded-none" disabled={busy || !unit.assigned_at} onClick={() => void redeem()}>{busy ? "Confirming…" : "Confirm redemption"}</Button>
            {!unit.assigned_at && <p className="text-xs text-muted-foreground">This code is not assigned to a Quest signup and cannot be redeemed here.</p>}
          </div>
        )}
      </div>}
      {result && <p role="status" className="mt-3 text-sm text-muted-foreground">{result}</p>}
    </section>
  );
}
