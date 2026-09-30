drop policy if exists qr_sessions_owner_select on public.qr_sessions;
drop policy if exists qr_sessions_participant_select on public.qr_sessions;

create policy qr_sessions_select
on public.qr_sessions
for select
to authenticated
using (
  (select auth.uid()) = owner_id
  or private.is_qr_participant(id)
);