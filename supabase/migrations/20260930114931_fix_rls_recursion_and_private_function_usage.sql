create or replace function private.is_qr_owner(p_qr_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.qr_sessions q
    where q.id = p_qr_id
      and q.owner_id = (select auth.uid())
      and q.deleted_at is null
  );
$$;

create or replace function private.is_qr_participant(p_qr_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.attendance a
    where a.qr_id = p_qr_id
      and a.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_qr_owner(uuid) from public;
revoke all on function private.is_qr_participant(uuid) from public;
grant execute on function private.is_qr_owner(uuid) to authenticated;
grant execute on function private.is_qr_participant(uuid) to authenticated;
grant usage on schema private to authenticated;

drop policy if exists qr_sessions_owner_select on public.qr_sessions;
drop policy if exists qr_sessions_participant_select on public.qr_sessions;
create policy qr_sessions_owner_select
on public.qr_sessions
for select
to authenticated
using ((select auth.uid()) = owner_id);
create policy qr_sessions_participant_select
on public.qr_sessions
for select
to authenticated
using (private.is_qr_participant(id));

drop policy if exists attendance_select_own_or_qr_owner on public.attendance;
create policy attendance_select_own_or_qr_owner
on public.attendance
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or private.is_qr_owner(qr_id)
);

revoke all on function private.is_qr_owner(uuid) from anon;
revoke all on function private.is_qr_participant(uuid) from anon;