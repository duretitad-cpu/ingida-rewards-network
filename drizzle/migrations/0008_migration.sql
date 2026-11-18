create or replace function public.quest_prize_preview()
returns table(item text, description text, image text, remaining integer)
language sql stable security definer set search_path = public as $$
  select i.name, i.description, i.image_path,
    (select count(*)::int from inventory_units u where u.item_id = i.id and u.assigned_at is null and u.claimed_at is null)
  from inventory_items i
  where i.quest_reward
  order by (select count(*) from inventory_units u where u.item_id = i.id and u.assigned_at is null and u.claimed_at is null) > 0 desc, i.created_at
  limit 1
$$;
revoke all on function public.quest_prize_preview() from public;
grant execute on function public.quest_prize_preview() to anon, authenticated;