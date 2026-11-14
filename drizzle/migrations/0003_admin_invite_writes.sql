GRANT INSERT, DELETE ON public.admin_invites TO authenticated;
CREATE POLICY "Admins add invites" ON public.admin_invites FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND invited_by = auth.uid());
CREATE POLICY "Admins delete invites" ON public.admin_invites FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') AND accepted_at IS NULL);