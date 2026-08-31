-- TAROT LUNA — ACCIONES SEGURAS DEL PANEL DE ADMINISTRACIÓN
-- Ejecutar una sola vez en Supabase > SQL Editor.

begin;

create or replace function public.admin_confirm_reservation(p_reservation_key uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_res public.reservations%rowtype;
  v_slot_keys text[];
  v_order text;
begin
  select * into v_res
  from public.reservations
  where reservation_key = p_reservation_key
  for update;

  if not found then raise exception 'Reserva no encontrada'; end if;
  if v_res.status = 'paid' then return; end if;
  if v_res.status not in ('pending_payment', 'payment_failed') then
    raise exception 'El estado de la reserva no permite confirmar el pago';
  end if;
  if ((v_res.appointment_date + v_res.appointment_time) at time zone v_res.timezone) <= now() then
    raise exception 'No se puede confirmar una cita pasada';
  end if;

  select array_agg(
    v_res.appointment_date::text || '|' ||
    to_char(v_res.appointment_time + (step * interval '10 minutes'), 'HH24:MI')
    order by step
  ) into v_slot_keys
  from generate_series(0, (v_res.duration / 10) - 1) step;

  delete from public.slot_holds where expires_at <= now();
  if exists (
    select 1 from public.booked_slots
    where slot_key = any(v_slot_keys)
      and reservation_key <> p_reservation_key
  ) then
    raise exception 'La franja ya está ocupada' using errcode = '23505';
  end if;

  delete from public.slot_holds where reservation_key = p_reservation_key;
  insert into public.booked_slots (slot_key, reservation_key)
  select unnest(v_slot_keys), p_reservation_key
  on conflict (slot_key) do nothing;

  v_order := 'MANUAL-' || upper(left(replace(p_reservation_key::text, '-', ''), 12));
  update public.reservations set
    status = 'paid',
    payment_provider = 'manual',
    payment_order = v_order,
    payment_response_code = 'MANUAL_OK',
    paid_at = now()
  where reservation_key = p_reservation_key;

  insert into public.payment_events (
    provider, provider_event_id, reservation_key, response_code, verified
  ) values ('manual', v_order, p_reservation_key, 'MANUAL_OK', true)
  on conflict (provider, provider_event_id) do nothing;

  insert into public.audit_log (reservation_key, action, actor)
  values (p_reservation_key, 'payment_confirmed_manually', 'admin');
end;
$$;

create or replace function public.admin_cancel_reservation(p_reservation_key uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_status text;
begin
  select status into v_status from public.reservations
  where reservation_key = p_reservation_key for update;
  if not found then raise exception 'Reserva no encontrada'; end if;
  if v_status in ('refunded', 'completed') then
    raise exception 'Esta reserva requiere un proceso específico';
  end if;

  delete from public.slot_holds where reservation_key = p_reservation_key;
  delete from public.booked_slots where reservation_key = p_reservation_key;
  update public.reservations set status = 'cancelled'
  where reservation_key = p_reservation_key;
  insert into public.audit_log (reservation_key, action, actor, metadata)
  values (p_reservation_key, 'reservation_cancelled', 'admin', jsonb_build_object('previous_status', v_status));
end;
$$;

create or replace function public.admin_delete_reservation(p_reservation_key uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_status text;
begin
  select status into v_status from public.reservations
  where reservation_key = p_reservation_key for update;
  if not found then raise exception 'Reserva no encontrada'; end if;
  if v_status not in ('pending_payment', 'payment_failed', 'cancelled') then
    raise exception 'Las reservas pagadas o finalizadas no pueden eliminarse directamente';
  end if;

  insert into public.audit_log (reservation_key, action, actor, metadata)
  values (p_reservation_key, 'reservation_deleted', 'admin', jsonb_build_object('status', v_status, 'reservation_key', p_reservation_key));
  delete from public.reservations where reservation_key = p_reservation_key;
end;
$$;

revoke all on function public.admin_confirm_reservation(uuid) from public, anon, authenticated;
revoke all on function public.admin_cancel_reservation(uuid) from public, anon, authenticated;
revoke all on function public.admin_delete_reservation(uuid) from public, anon, authenticated;
grant execute on function public.admin_confirm_reservation(uuid) to service_role;
grant execute on function public.admin_cancel_reservation(uuid) to service_role;
grant execute on function public.admin_delete_reservation(uuid) to service_role;

commit;
