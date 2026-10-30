ALTER TABLE public.waitlist_submissions ADD COLUMN IF NOT EXISTS business_name text NOT NULL DEFAULT '';
ALTER TABLE public.waitlist_submissions ADD COLUMN IF NOT EXISTS wants_alerts boolean;
ALTER TABLE public.waitlist_submissions ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';

CREATE TYPE public.app_role AS ENUM ('admin', 'operator');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.is_operator(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','operator'))
$$;

CREATE TABLE public.operator_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  used_by uuid,
  used_at timestamptz
);
GRANT SELECT, INSERT, DELETE ON public.operator_invite_codes TO authenticated;
GRANT ALL ON public.operator_invite_codes TO service_role;
ALTER TABLE public.operator_invite_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read codes" ON public.operator_invite_codes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create codes" ON public.operator_invite_codes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND created_by = auth.uid() AND used_by IS NULL);
CREATE POLICY "Admins delete unused codes" ON public.operator_invite_codes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') AND used_by IS NULL);

GRANT SELECT, UPDATE ON public.waitlist_submissions TO authenticated;
CREATE POLICY "Operators read submissions" ON public.waitlist_submissions FOR SELECT TO authenticated USING (public.is_operator(auth.uid()));
CREATE POLICY "Operators update submissions" ON public.waitlist_submissions FOR UPDATE TO authenticated USING (public.is_operator(auth.uid())) WITH CHECK (public.is_operator(auth.uid()));

-- First account becomes admin; every later account must redeem an unused invite code.
CREATE OR REPLACE FUNCTION public.handle_operator_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _code text := upper(trim(coalesce(NEW.raw_user_meta_data->>'invite_code', '')));
BEGIN
  PERFORM pg_advisory_xact_lock(4242);
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
    RETURN NEW;
  END IF;
  UPDATE public.operator_invite_codes SET used_by = NEW.id, used_at = now()
    WHERE code = _code AND used_by IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'A valid operator invite code is required';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operator');
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_operator_signup() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created_operator AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_operator_signup();