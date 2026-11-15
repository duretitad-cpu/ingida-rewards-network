ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS quest_reward boolean NOT NULL DEFAULT false;
ALTER TABLE public.inventory_units ADD COLUMN IF NOT EXISTS assigned_at timestamptz;
ALTER TABLE public.inventory_units ADD COLUMN IF NOT EXISTS assigned_name text NOT NULL DEFAULT '';
ALTER TABLE public.inventory_units ADD COLUMN IF NOT EXISTS assigned_phone text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.claim_quest_merch(_name text, _phone text, _answers jsonb)
RETURNS TABLE(code text, item text, already boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n text := left(trim(coalesce(_name,'')),100);
        _p text := left(regexp_replace(coalesce(_phone,''),'[^0-9+]','','g'),20);
        _u record;
BEGIN
  IF _n = '' OR length(_p) < 9 THEN RAISE EXCEPTION 'Invalid entry'; END IF;
  SELECT u.code, i.name INTO _u FROM inventory_units u JOIN inventory_items i ON i.id = u.item_id
    WHERE u.assigned_phone = _p LIMIT 1;
  IF FOUND THEN RETURN QUERY SELECT _u.code, _u.name, true; RETURN; END IF;
  INSERT INTO waitlist_submissions (name, email, phone, role, source, wants_alerts, notes)
    VALUES (_n, '', _p, 'member', 'quest', true, left(coalesce(_answers,'{}'::jsonb)::text, 500));
  UPDATE inventory_units u SET assigned_at = now(), assigned_name = _n, assigned_phone = _p
    WHERE u.id = (SELECT x.id FROM inventory_units x JOIN inventory_items i ON i.id = x.item_id
      WHERE i.quest_reward AND x.assigned_at IS NULL AND x.claimed_at IS NULL
      ORDER BY x.created_at LIMIT 1 FOR UPDATE SKIP LOCKED)
    RETURNING u.code, (SELECT name FROM inventory_items WHERE id = u.item_id) INTO _u;
  IF FOUND THEN RETURN QUERY SELECT _u.code, _u.name, false;
  ELSE RETURN QUERY SELECT NULL::text, NULL::text, false; END IF;
END; $$;
REVOKE EXECUTE ON FUNCTION public.claim_quest_merch(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_quest_merch(text, text, jsonb) TO anon, authenticated;