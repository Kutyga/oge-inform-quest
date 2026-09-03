-- Разово выполни в Supabase SQL Editor на своём проекте — чинит баг, из-за которого
-- назначение роли 'admin' через SQL Editor откатывалось обратно на 'user'.
-- (create or replace безопасно перезаписывает функцию, таблицы не трогает)

create or replace function public.protect_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

-- теперь можно назначить админа:
-- update public.profiles set role = 'admin' where email = 'твой-email@...';
