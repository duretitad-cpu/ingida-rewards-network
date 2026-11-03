import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type PublicNfcCard = {
  id: string;
  card_key: string;
  card_name: string;
  owner_name: string;
  owner_title: string;
  owner_phone: string;
  owner_email: string;
  destination_url: string;
  capture_mode: boolean;
};

export function normalizeUrl(url: string) {
  const v = url.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Looks up a card by its permanent key, counts the tap, and returns only public-safe fields. */
export const tapNfcCard = createServerFn({ method: "GET" })
  .inputValidator((input: { cardKey: string }) => ({ cardKey: z.string().trim().min(1).max(60).parse(input.cardKey) }))
  .handler(async ({ data }): Promise<{ status: "ok"; card: PublicNfcCard } | { status: "missing" | "inactive" }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: card } = await supabaseAdmin
      .from("nfc_cards")
      .select("id, card_key, card_name, owner_name, owner_title, owner_phone, owner_email, destination_url, capture_mode, is_active, tap_count")
      .eq("card_key", data.cardKey)
      .maybeSingle();
    if (!card) return { status: "missing" };
    if (!card.is_active) return { status: "inactive" };
    await supabaseAdmin.from("nfc_cards").update({ tap_count: card.tap_count + 1 }).eq("id", card.id);
    const { is_active: _a, tap_count: _t, ...pub } = card;
    return { status: "ok", card: { ...pub, destination_url: normalizeUrl(pub.destination_url) } };
  });

export const nfcContactSchema = z.object({
  cardId: z.string().uuid(),
  full_name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().max(30).regex(/^[+\d\s()-]*$/, "Use digits only"),
  email: z.string().trim().max(255).email("Enter a valid email").or(z.literal("")),
  company: z.string().trim().max(120).default(""),
  notes: z.string().trim().max(500).default(""),
  consent_given: z.literal(true, { errorMap: () => ({ message: "Please agree to be contacted" }) }),
}).refine((v) => v.phone || v.email, { message: "Add a phone or email", path: ["phone"] });

export const submitNfcContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => nfcContactSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { cardId, ...entry } = data;
    const { data: card } = await supabaseAdmin.from("nfc_cards").select("id, is_active").eq("id", cardId).maybeSingle();
    if (!card?.is_active) throw new Error("This card is not active.");
    const { error } = await supabaseAdmin.from("nfc_contacts").insert({ card_id: cardId, ...entry });
    if (error) {
      console.error("NFC contact storage failed", error.code);
      throw new Error("Your details could not be saved. Please try again.");
    }
    return { saved: true };
  });
