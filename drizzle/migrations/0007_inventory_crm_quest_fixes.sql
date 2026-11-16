-- Product descriptions are customer-facing inventory details, separate from internal notes.
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

-- Make CRM contact deletion durable for authenticated operators. Drop/recreate
-- policies so this migration is safe whether the original delete policy exists or not.
ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_contacts ENABLE ROW LEVEL SECURITY;
GRANT DELETE ON public.waitlist_submissions TO authenticated;
GRANT DELETE ON public.nfc_contacts TO authenticated;
DROP POLICY IF EXISTS "Operators delete waitlist submissions" ON public.waitlist_submissions;
CREATE POLICY "Operators delete waitlist submissions" ON public.waitlist_submissions
  FOR DELETE TO authenticated USING (public.is_operator(auth.uid()));
DROP POLICY IF EXISTS "Operators delete NFC contacts" ON public.nfc_contacts;
CREATE POLICY "Operators delete NFC contacts" ON public.nfc_contacts
  FOR DELETE TO authenticated USING (public.is_operator(auth.uid()));

-- Quest leads are persisted to the same CRM table, and codes always come from
-- inventory_units belonging to an item explicitly marked as a Quest Prize.
CREATE OR REPLACE FUNCTION public.claim_quest_merch(_name text, _phone text, _answers jsonb)
RETURNS TABLE(code text, item text, already boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _n text := left(trim(coalesce(_name, '')), 100);
  _digits text := regexp_replace(coalesce(_phone, ''), '[^0-9]', '', 'g');
  _p text;
  _u record;
BEGIN
  IF left(_digits, 3) = '251' THEN _digits := substr(_digits, 4);
  ELSIF left(_digits, 1) = '0' THEN _digits := substr(_digits, 2); END IF;
  IF _n = '' OR _digits !~ '^[79][0-9]{8}$' THEN RAISE EXCEPTION 'Enter an Ethiopian mobile number'; END IF;

  _p := '+251' || _digits;
  PERFORM pg_advisory_xact_lock(hashtextextended(_p, 0));

  IF NOT EXISTS (
    SELECT 1 FROM public.waitlist_submissions w
    WHERE w.source = 'quest' AND regexp_replace(w.phone, '[^0-9]', '', 'g') = '251' || _digits
  ) THEN
    INSERT INTO public.waitlist_submissions (name, email, phone, role, source, wants_alerts, notes)
    VALUES (_n, '', _p, 'member', 'quest', true, left(coalesce(_answers, '{}'::jsonb)::text, 500));
  END IF;

  SELECT u.code, i.name INTO _u
  FROM public.inventory_units u JOIN public.inventory_items i ON i.id = u.item_id
  WHERE u.assigned_at IS NOT NULL
    AND regexp_replace(u.assigned_phone, '[^0-9]', '', 'g') IN ('251' || _digits, '0' || _digits, _digits)
  ORDER BY u.assigned_at LIMIT 1;
  IF FOUND THEN RETURN QUERY SELECT _u.code, _u.name, true; RETURN; END IF;

  UPDATE public.inventory_units u
  SET assigned_at = now(), assigned_name = _n, assigned_phone = _p
  WHERE u.id = (
    SELECT x.id FROM public.inventory_units x
    JOIN public.inventory_items i ON i.id = x.item_id
    WHERE i.quest_reward AND x.assigned_at IS NULL AND x.claimed_at IS NULL
    ORDER BY x.created_at LIMIT 1 FOR UPDATE OF x SKIP LOCKED
  )
  RETURNING u.code, (SELECT i.name FROM public.inventory_items i WHERE i.id = u.item_id) INTO _u;

  IF FOUND THEN RETURN QUERY SELECT _u.code, _u.name, false;
  ELSE RETURN QUERY SELECT NULL::text, NULL::text, false; END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.claim_quest_merch(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_quest_merch(text, text, jsonb) TO anon, authenticated;
