CREATE TABLE public.quest_settings (
 id text PRIMARY KEY DEFAULT 'quest' CHECK (id = 'quest'),
 rewards_enabled boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.quest_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.quest_settings TO authenticated;
GRANT ALL ON public.quest_settings TO service_role;
ALTER TABLE public.quest_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public game mode" ON public.quest_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Operators create game mode" ON public.quest_settings FOR INSERT TO authenticated WITH CHECK (public.is_operator(auth.uid()));
CREATE POLICY "Operators update game mode" ON public.quest_settings FOR UPDATE TO authenticated USING (public.is_operator(auth.uid())) WITH CHECK (public.is_operator(auth.uid()));

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) AND (_user_id = auth.uid() OR auth.role() = 'service_role');
$$;
CREATE OR REPLACE FUNCTION public.is_operator(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','operator')) AND (_user_id = auth.uid() OR auth.role() = 'service_role');
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role), public.is_operator(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role), public.is_operator(uuid) TO authenticated, service_role;
DROP POLICY IF EXISTS "Admins delete cards" ON public.nfc_cards;
DROP POLICY IF EXISTS "Admins delete contacts" ON public.nfc_contacts;

CREATE OR REPLACE FUNCTION public.claim_quest_prize(_name text, _phone text, _answers jsonb)
RETURNS TABLE(code text, item text, description text, image text, already boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
 _n text := trim(coalesce(_name, ''));
 _digits text := regexp_replace(coalesce(_phone, ''), '[^0-9]', '', 'g');
 _p text; _uid uuid; _rewards boolean;
BEGIN
 IF length(_n) NOT BETWEEN 1 AND 100 OR length(coalesce(_phone,'')) > 30 OR jsonb_typeof(_answers) IS DISTINCT FROM 'object' OR octet_length(_answers::text) > 4000 THEN RAISE EXCEPTION 'Invalid signup'; END IF;
 IF left(_digits,3) = '251' THEN _digits := substr(_digits,4); ELSIF left(_digits,1) = '0' THEN _digits := substr(_digits,2); END IF;
 IF _digits !~ '^[79][0-9]{8}$' THEN RAISE EXCEPTION 'Enter an Ethiopian mobile number'; END IF;
 _p := '+251' || _digits;
 PERFORM pg_advisory_xact_lock(hashtextextended(_p,0));
 SELECT coalesce((SELECT s.rewards_enabled FROM public.quest_settings s WHERE s.id='quest'),true) INTO _rewards;
 IF NOT EXISTS (SELECT 1 FROM public.waitlist_submissions w WHERE w.source='quest' AND regexp_replace(w.phone,'[^0-9]','','g') = '251' || _digits) THEN
 INSERT INTO public.waitlist_submissions(name,email,phone,role,source,wants_alerts,notes) VALUES (_n,'',_p,'member','quest',coalesce((_answers->>'wants_alerts')::boolean,true),left((_answers || jsonb_build_object('rewards_enabled',_rewards))::text,4000));
 END IF;
 IF NOT _rewards THEN RETURN QUERY SELECT NULL::text,NULL::text,NULL::text,NULL::text,false; RETURN; END IF;
 SELECT u.id INTO _uid FROM public.inventory_units u WHERE u.assigned_at IS NOT NULL AND regexp_replace(u.assigned_phone,'[^0-9]','','g') = '251' || _digits AND lower(u.assigned_name)=lower(_n) ORDER BY u.assigned_at LIMIT 1;
 IF _uid IS NOT NULL THEN RETURN QUERY SELECT u.code,i.name,i.description,i.image_path,true FROM public.inventory_units u JOIN public.inventory_items i ON i.id=u.item_id WHERE u.id=_uid; RETURN; END IF;
 IF EXISTS (SELECT 1 FROM public.inventory_units u WHERE u.assigned_at IS NOT NULL AND regexp_replace(u.assigned_phone,'[^0-9]','','g') = '251' || _digits) THEN RETURN QUERY SELECT NULL::text,NULL::text,NULL::text,NULL::text,true; RETURN; END IF;
 PERFORM pg_advisory_xact_lock(777001);
 IF (SELECT count(*) FROM public.inventory_units WHERE assigned_at > now()-interval '10 minutes') >= 15 THEN RETURN QUERY SELECT NULL::text,NULL::text,NULL::text,NULL::text,false; RETURN; END IF;
 SELECT x.id INTO _uid FROM public.inventory_units x JOIN public.inventory_items i ON i.id=x.item_id WHERE i.quest_reward AND x.assigned_at IS NULL AND x.claimed_at IS NULL ORDER BY x.created_at LIMIT 1 FOR UPDATE OF x SKIP LOCKED;
 IF _uid IS NULL THEN RETURN QUERY SELECT NULL::text,NULL::text,NULL::text,NULL::text,false; RETURN; END IF;
 UPDATE public.inventory_units SET assigned_at=now(),assigned_name=_n,assigned_phone=_p WHERE id=_uid;
 RETURN QUERY SELECT u.code,i.name,i.description,i.image_path,false FROM public.inventory_units u JOIN public.inventory_items i ON i.id=u.item_id WHERE u.id=_uid;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.claim_quest_prize(text,text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_quest_prize(text,text,jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.submit_quest_signup(_name text, _phone text, _answers jsonb)
RETURNS TABLE(code text,item text,description text,image text,already boolean,rewards_enabled boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _enabled boolean;
BEGIN
 SELECT coalesce((SELECT s.rewards_enabled FROM public.quest_settings s WHERE s.id='quest'),true) INTO _enabled;
 RETURN QUERY SELECT p.code,p.item,p.description,p.image,p.already,_enabled FROM public.claim_quest_prize(_name,_phone,_answers) p;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.submit_quest_signup(text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quest_signup(text,text,jsonb) TO anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION public.quest_prize_preview()
RETURNS TABLE(item text,description text,image text,remaining integer,sticker_title text,sticker_hashtag text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT i.name,i.description,i.image_path,(SELECT count(*)::int FROM public.inventory_units u WHERE u.item_id=i.id AND u.assigned_at IS NULL AND u.claimed_at IS NULL),i.sticker_title,i.sticker_hashtag
FROM public.inventory_items i WHERE i.quest_reward AND coalesce((SELECT s.rewards_enabled FROM public.quest_settings s WHERE s.id='quest'),true)
ORDER BY (SELECT count(*) FROM public.inventory_units u WHERE u.item_id=i.id AND u.assigned_at IS NULL AND u.claimed_at IS NULL)>0 DESC,i.created_at LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.quest_prize_preview() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quest_prize_preview() TO anon,authenticated,service_role;