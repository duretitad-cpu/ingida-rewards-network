CREATE TABLE public.nfc_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_key text NOT NULL UNIQUE,
  card_name text NOT NULL DEFAULT '',
  owner_name text NOT NULL DEFAULT '',
  owner_title text NOT NULL DEFAULT '',
  owner_phone text NOT NULL DEFAULT '',
  owner_email text NOT NULL DEFAULT '',
  destination_url text NOT NULL DEFAULT '',
  capture_mode boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  tap_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nfc_cards TO authenticated;
GRANT ALL ON public.nfc_cards TO service_role;
ALTER TABLE public.nfc_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators read cards" ON public.nfc_cards FOR SELECT TO authenticated USING (public.is_operator(auth.uid()));
CREATE POLICY "Operators add cards" ON public.nfc_cards FOR INSERT TO authenticated WITH CHECK (public.is_operator(auth.uid()));
CREATE POLICY "Operators update cards" ON public.nfc_cards FOR UPDATE TO authenticated USING (public.is_operator(auth.uid())) WITH CHECK (public.is_operator(auth.uid()));
CREATE POLICY "Admins delete cards" ON public.nfc_cards FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.nfc_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.nfc_cards(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  consent_given boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.nfc_contacts TO authenticated;
GRANT ALL ON public.nfc_contacts TO service_role;
ALTER TABLE public.nfc_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators read contacts" ON public.nfc_contacts FOR SELECT TO authenticated USING (public.is_operator(auth.uid()));
CREATE POLICY "Admins delete contacts" ON public.nfc_contacts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX nfc_contacts_card_idx ON public.nfc_contacts(card_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.nfc_touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER nfc_cards_touch BEFORE UPDATE ON public.nfc_cards FOR EACH ROW EXECUTE FUNCTION public.nfc_touch_updated_at();

INSERT INTO public.nfc_cards (card_key, card_name, destination_url) VALUES
 ('01', 'Card 01 — Company Profile & Brochure', 'https://ingida-rewards-network.lovable.app'),
 ('02', 'Card 02 — Investor Presentation & Deck', 'https://ingida-rewards-network.lovable.app');