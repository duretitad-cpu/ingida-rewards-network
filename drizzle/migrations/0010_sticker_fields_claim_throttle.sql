ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS sticker_title text NOT NULL DEFAULT 'MendSpace x Lock In';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS sticker_hashtag text NOT NULL DEFAULT '#MyingidaMoment';
DROP FUNCTION IF EXISTS public.quest_prize_preview();
CREATE FUNCTION public.quest_prize_preview()
 RETURNS TABLE(item text, description text, image text, remaining integer, sticker_title text, sticker_hashtag text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $f$
  select i.name, i.description, i.image_path,
    (select count(*)::int from inventory_units u where u.item_id = i.id and u.assigned_at is null and u.claimed_at is null),
    i.sticker_title, i.sticker_hashtag
  from inventory_items i where i.quest_reward
  order by (select count(*) from inventory_units u where u.item_id = i.id and u.assigned_at is null and u.claimed_at is null) > 0 desc, i.created_at
  limit 1
$f$;
GRANT EXECUTE ON FUNCTION public.quest_prize_preview() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_quest_prize(_name text, _phone text, _answers jsonb)
 RETURNS TABLE(code text, item text, description text, image text, already boolean)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _n text := left(trim(coalesce(_name, '')), 100);
  _digits text := regexp_replace(coalesce(_phone, ''), '[^0-9]', '', 'g');
  _p text; _uid uuid;
BEGIN
  IF left(_digits, 3) = '251' THEN _digits := substr(_digits, 4);
  ELSIF left(_digits, 1) = '0' THEN _digits := substr(_digits, 2); END IF;
  IF _n = '' OR _digits !~ '^[79][0-9]{8}$' THEN RAISE EXCEPTION 'Enter an Ethiopian mobile number'; END IF;
  _p := '+251' || _digits;
  PERFORM pg_advisory_xact_lock(hashtextextended(_p, 0));

  IF NOT EXISTS (SELECT 1 FROM public.waitlist_submissions w WHERE w.source = 'quest' AND regexp_replace(w.phone, '[^0-9]', '', 'g') = '251' || _digits) THEN
    INSERT INTO public.waitlist_submissions (name, email, phone, role, source, wants_alerts, notes)
    VALUES (_n, '', _p, 'member', 'quest', true, left(coalesce(_answers, '{}'::jsonb)::text, 500));
  END IF;

  SELECT u.id INTO _uid FROM public.inventory_units u
  WHERE u.assigned_at IS NOT NULL AND regexp_replace(u.assigned_phone, '[^0-9]', '', 'g') = '251' || _digits
    AND lower(u.assigned_name) = lower(_n)
  ORDER BY u.assigned_at LIMIT 1;
  IF _uid IS NOT NULL THEN
    RETURN QUERY SELECT u.code, i.name, i.description, i.image_path, true FROM public.inventory_units u JOIN public.inventory_items i ON i.id = u.item_id WHERE u.id = _uid;
    RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM public.inventory_units u WHERE u.assigned_at IS NOT NULL AND regexp_replace(u.assigned_phone, '[^0-9]', '', 'g') = '251' || _digits) THEN
    RETURN QUERY SELECT NULL::text, NULL::text, NULL::text, NULL::text, true; RETURN;
  END IF;

  -- Throttle: at most 15 new prizes per 10 minutes across all players.
  PERFORM pg_advisory_xact_lock(777001);
  IF (SELECT count(*) FROM public.inventory_units WHERE assigned_at > now() - interval '10 minutes') >= 15 THEN
    RETURN QUERY SELECT NULL::text, NULL::text, NULL::text, NULL::text, false; RETURN;
  END IF;

  SELECT x.id INTO _uid FROM public.inventory_units x JOIN public.inventory_items i ON i.id = x.item_id
  WHERE i.quest_reward AND x.assigned_at IS NULL AND x.claimed_at IS NULL
  ORDER BY x.created_at LIMIT 1 FOR UPDATE OF x SKIP LOCKED;
  IF _uid IS NULL THEN
    RETURN QUERY SELECT NULL::text, NULL::text, NULL::text, NULL::text, false; RETURN;
  END IF;
  UPDATE public.inventory_units SET assigned_at = now(), assigned_name = _n, assigned_phone = _p WHERE id = _uid;
  RETURN QUERY SELECT u.code, i.name, i.description, i.image_path, false FROM public.inventory_units u JOIN public.inventory_items i ON i.id = u.item_id WHERE u.id = _uid;
END;
$function$;