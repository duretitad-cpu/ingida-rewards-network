ALTER TABLE public.waitlist_submissions DROP CONSTRAINT IF EXISTS waitlist_email_role_unique;
DROP INDEX IF EXISTS public.waitlist_email_role_unique;
CREATE UNIQUE INDEX waitlist_email_role_unique ON public.waitlist_submissions (lower(email), role) WHERE email <> '';