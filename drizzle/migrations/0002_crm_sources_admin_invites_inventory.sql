ALTER TABLE public.waitlist_submissions ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'website';
COMMENT ON COLUMN public.waitlist_submissions.status IS 'DEPRECATED: replaced by source in the operator CRM';
ALTER TABLE public.nfc_contacts ADD COLUMN IF NOT EXISTS contact_type text NOT NULL DEFAULT 'member';
GRANT UPDATE ON public.nfc_contacts TO authenticated;
CREATE POLICY "Operators update contacts" ON public.nfc_contacts FOR UPDATE TO authenticated USING (public.is_operator(auth.uid())) WITH CHECK (public.is_operator(auth.uid()));
COMMENT ON TABLE public.operator_invite_codes IS 'DEPRECATED: replaced by admin_invites';

CREATE TABLE public.admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  invited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);
GRANT SELECT ON public.admin_invites TO authenticated;
GRANT ALL ON public.admin_invites TO service_role;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read invites" ON public.admin_invites FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_operator_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _code text := upper(trim(coalesce(NEW.raw_user_meta_data->>'invite_code', '')));
BEGIN
  PERFORM pg_advisory_xact_lock(4242);
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
    RETURN NEW;
  END IF;
  UPDATE public.admin_invites SET accepted_at = now()
    WHERE lower(email) = lower(NEW.email) AND accepted_at IS NULL;
  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
    RETURN NEW;
  END IF;
  UPDATE public.operator_invite_codes SET used_by = NEW.id, used_at = now()
    WHERE code = _code AND used_by IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'An admin invitation is required';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operator');
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_operator_signup() FROM PUBLIC, anon, authenticated;

CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  notes text NOT NULL DEFAULT '',
  image_path text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 0,
  code_prefix text NOT NULL DEFAULT 'ING',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators read items" ON public.inventory_items FOR SELECT TO authenticated USING (public.is_operator(auth.uid()));
CREATE POLICY "Operators add items" ON public.inventory_items FOR INSERT TO authenticated WITH CHECK (public.is_operator(auth.uid()));
CREATE POLICY "Operators update items" ON public.inventory_items FOR UPDATE TO authenticated USING (public.is_operator(auth.uid())) WITH CHECK (public.is_operator(auth.uid()));
CREATE POLICY "Admins delete items" ON public.inventory_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.inventory_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  claimed_at timestamptz,
  claimed_by uuid,
  claim_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inventory_units_item_idx ON public.inventory_units(item_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_units TO authenticated;
GRANT ALL ON public.inventory_units TO service_role;
ALTER TABLE public.inventory_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators read units" ON public.inventory_units FOR SELECT TO authenticated USING (public.is_operator(auth.uid()));
CREATE POLICY "Operators add units" ON public.inventory_units FOR INSERT TO authenticated WITH CHECK (public.is_operator(auth.uid()));
CREATE POLICY "Operators update units" ON public.inventory_units FOR UPDATE TO authenticated USING (public.is_operator(auth.uid())) WITH CHECK (public.is_operator(auth.uid()));
CREATE POLICY "Admins delete units" ON public.inventory_units FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators read inventory images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'inventory' AND public.is_operator(auth.uid()));
CREATE POLICY "Operators upload inventory images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inventory' AND public.is_operator(auth.uid()));
CREATE POLICY "Operators delete inventory images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'inventory' AND public.is_operator(auth.uid()));