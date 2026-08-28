create table if not exists public.reservations (
  id bigint generated always as identity primary key,
  reservation_key uuid unique not null,
  name text not null,
  email text not null,
  phone text not null,
  category text not null,
  duration integer not null check (duration in (10, 30, 60)),
  amount_cents integer not null check (amount_cents in (1000, 2500, 5000)),
  date date not null,
  time time not null,
  notes text not null default '',
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'cancelled', 'refunded', 'payment_failed')),
  redsys_order text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.booked_slots (
  slot_key text primary key,
  reservation_key uuid not null references public.reservations(reservation_key) on delete cascade
);

create or replace function public.create_reservation(
  p_reservation_key uuid, p_name text, p_email text, p_phone text,
  p_category text, p_duration integer, p_date date, p_time time,
  p_notes text, p_slot_keys text[]
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into reservations (reservation_key, name, email, phone, category, duration, amount_cents, date, time, notes)
  values (p_reservation_key, p_name, p_email, p_phone, p_category, p_duration,
    case p_duration when 10 then 1000 when 30 then 2500 else 5000 end,
    p_date, p_time, p_notes);
end;
$$;

revoke all on function public.create_reservation(uuid,text,text,text,text,integer,date,time,text,text[]) from public, anon, authenticated;

create or replace function public.confirm_paid_reservation(
  p_reservation_key uuid, p_redsys_order text, p_slot_keys text[]
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into booked_slots (slot_key, reservation_key)
  select unnest(p_slot_keys), p_reservation_key;
  update reservations
  set status = 'paid', redsys_order = p_redsys_order, paid_at = now()
  where reservation_key = p_reservation_key and status = 'pending_payment';
  if not found then raise exception 'Reserva no disponible para confirmar'; end if;
end;
$$;

revoke all on function public.confirm_paid_reservation(uuid,text,text[]) from public, anon, authenticated;
