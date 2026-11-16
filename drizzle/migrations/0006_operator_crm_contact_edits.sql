ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;
GRANT UPDATE, DELETE ON public.waitlist_submissions TO authenticated;
CREATE POLICY "Operators delete waitlist submissions" ON public.waitlist_submissions FOR DELETE TO authenticated USING (public.is_operator(auth.uid()));

GRANT UPDATE, DELETE ON public.nfc_contacts TO authenticated;
CREATE POLICY "Operators delete NFC contacts" ON public.nfc_contacts FOR DELETE TO authenticated USING (public.is_operator(auth.uid()));
