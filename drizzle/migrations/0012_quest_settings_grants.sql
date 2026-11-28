GRANT SELECT ON public.quest_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.quest_settings TO authenticated;
GRANT ALL ON public.quest_settings TO service_role;
INSERT INTO public.quest_settings (id, rewards_enabled) VALUES ('quest', true) ON CONFLICT (id) DO NOTHING;