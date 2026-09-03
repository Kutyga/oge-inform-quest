-- Разово выполни в Supabase SQL Editor на своём проекте.
-- Без этого админ не может менять роль ДРУГОГО пользователя из панели —
-- текущая политика profiles_update_own разрешает обновлять только свою
-- собственную строку. Эта политика добавляет право админу обновлять
-- любую строку profiles (какие именно поля реально меняются, всё равно
-- решает панель на клиенте + триггер protect_role для самой колонки role).

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());
