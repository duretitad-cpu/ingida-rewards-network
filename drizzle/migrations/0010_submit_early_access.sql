CREATE OR REPLACE FUNCTION public.submit_early_access(_name text, _email text, _phone text, _role text, _business_name text, _wants_alerts boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _n text := left(trim(coalesce(_name,'')),100);
  _e text := lower(left(trim(coalesce(_email,'')),255));
  _digits text := regexp_replace(coalesce(_phone,''),'[^0-9]','','g');
  _b text := left(trim(coalesce(_business_name,'')),120);
BEGIN
  IF left(_digits,3)='251' THEN _digits := substr(_digits,4);
  ELSIF left(_digits,1)='0' THEN _digits := substr(_digits,2); END IF;
  IF _n='' THEN RAISE EXCEPTION 'Please enter your name'; END IF;
  IF _e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'Please enter a valid email'; END IF;
  IF _digits !~ '^[79][0-9]{8}$' THEN RAISE EXCEPTION 'Enter an Ethiopian mobile number'; END IF;
  IF _role NOT IN ('member','merchant') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  IF _role='merchant' AND _b='' THEN RAISE EXCEPTION 'Please enter your business name'; END IF;
  INSERT INTO public.waitlist_submissions (name,email,phone,role,business_name,wants_alerts,source)
  VALUES (_n,_e,'+251'||_digits,_role,CASE WHEN _role='merchant' THEN _b ELSE '' END,
          CASE WHEN _role='member' THEN coalesce(_wants_alerts,false) ELSE NULL END,'website')
  ON CONFLICT DO NOTHING;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.submit_early_access(text,text,text,text,text,boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_early_access(text,text,text,text,text,boolean) TO anon, authenticated;