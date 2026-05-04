-- Spirits domain setup (products + sessions + submit RPC)
-- Date: 2026-05-04

begin;

create table if not exists public.spirits_products (
  id uuid primary key default gen_random_uuid(),
  category text,
  name text not null,
  producer text not null,
  threshold integer check (threshold is null or (threshold >= 1 and threshold <= 99)),
  purchase_price numeric(10,2) check (purchase_price is null or purchase_price >= 0),
  sale_price numeric(10,2) check (sale_price is null or sale_price >= 0),
  qty integer not null default 0 check (qty >= 0),
  warehouse numeric(10,2),
  margin numeric(10,2),
  updated_at timestamptz not null default now()
);

create index if not exists idx_spirits_products_category on public.spirits_products(category);
create index if not exists idx_spirits_products_producer on public.spirits_products(producer);
create index if not exists idx_spirits_products_qty on public.spirits_products(qty);
create index if not exists idx_spirits_products_threshold on public.spirits_products(threshold);
create index if not exists idx_spirits_products_name_lower on public.spirits_products(lower(name));

create table if not exists public.spirits_sessions (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('pending', 'submitted', 'cancelled')),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  total_qty integer,
  source text not null default 'web'
);

create index if not exists idx_spirits_sessions_status_created
  on public.spirits_sessions(status, created_at desc);
create index if not exists idx_spirits_sessions_status_submitted
  on public.spirits_sessions(status, submitted_at desc);

create table if not exists public.spirits_session_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.spirits_sessions(id) on delete cascade,
  spirit_id uuid references public.spirits_products(id) on delete set null,
  qty integer not null check (qty > 0),
  spirit_name text,
  spirit_producer text,
  spirit_category text
);

create index if not exists idx_spirits_session_items_session on public.spirits_session_items(session_id);
create index if not exists idx_spirits_session_items_spirit on public.spirits_session_items(spirit_id);

create or replace function public.spirits_products_before_write()
returns trigger
language plpgsql
as $$
begin
  if new.name is not null then
    new.name := upper(trim(new.name));
  end if;
  if new.producer is not null then
    new.producer := initcap(lower(trim(new.producer)));
  end if;
  if new.category is not null then
    new.category := initcap(lower(trim(new.category)));
  end if;

  if new.purchase_price is not null then
    new.purchase_price := round(new.purchase_price::numeric, 2);
  end if;
  if new.sale_price is not null then
    new.sale_price := round(new.sale_price::numeric, 2);
  end if;

  if new.purchase_price is not null then
    new.warehouse := round((new.purchase_price * greatest(coalesce(new.qty, 0), 0))::numeric, 2);
  else
    new.warehouse := null;
  end if;

  if new.purchase_price is not null and new.sale_price is not null then
    new.margin := round((new.sale_price - new.purchase_price)::numeric, 2);
  else
    new.margin := null;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger spirits_products_before_write
before insert or update on public.spirits_products
for each row execute function public.spirits_products_before_write();

create or replace function public.submit_spirits_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_total_qty integer;
  v_status text;
begin
  select status
    into v_status
  from public.spirits_sessions
  where id = p_session_id
  for update;

  if v_status is null then
    raise exception 'spirits session not found: %', p_session_id;
  end if;

  if v_status <> 'pending' then
    raise exception 'spirits session % is not pending (status=%)', p_session_id, v_status;
  end if;

  -- Safety check: prevent negative stock
  if exists (
    select 1
    from public.spirits_session_items i
    join public.spirits_products s on s.id = i.spirit_id
    where i.session_id = p_session_id
      and coalesce(s.qty, 0) - i.qty < 0
  ) then
    raise exception 'insufficient spirits stock for session %', p_session_id;
  end if;

  update public.spirits_products s
  set qty = greatest(0, s.qty - i.qty)
  from public.spirits_session_items i
  where i.session_id = p_session_id
    and i.spirit_id = s.id;

  select coalesce(sum(qty), 0)
    into v_total_qty
  from public.spirits_session_items
  where session_id = p_session_id;

  update public.spirits_sessions
  set status = 'submitted',
      submitted_at = now(),
      total_qty = v_total_qty
  where id = p_session_id;
end;
$$;

alter table public.spirits_products enable row level security;
alter table public.spirits_sessions enable row level security;
alter table public.spirits_session_items enable row level security;

-- permissive policies aligned with current anonymous frontend model
drop policy if exists spirits_products_all_anon on public.spirits_products;
drop policy if exists spirits_sessions_all_anon on public.spirits_sessions;
drop policy if exists spirits_session_items_all_anon on public.spirits_session_items;

create policy spirits_products_all_anon on public.spirits_products
for all to anon using (true) with check (true);

create policy spirits_sessions_all_anon on public.spirits_sessions
for all to anon using (true) with check (true);

create policy spirits_session_items_all_anon on public.spirits_session_items
for all to anon using (true) with check (true);

grant select, insert, update, delete on public.spirits_products to anon;
grant select, insert, update, delete on public.spirits_sessions to anon;
grant select, insert, update, delete on public.spirits_session_items to anon;
grant execute on function public.submit_spirits_session(uuid) to anon;

commit;
