-- Enoteca / wines: add dedicated supplier support
-- Run in Supabase SQL Editor (project ndrgcfyoiyychjukhrno).

begin;

-- 1) Add supplier column to wines (used by app CRUD).
alter table if exists public.wines
  add column if not exists supplier text;

-- 2) Index for archive filter/sort performance.
create index if not exists wines_supplier_idx
  on public.wines (supplier);

-- 3) Optional dedicated supplier registry (future-proof).
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists suppliers_name_idx
  on public.suppliers (name);

-- 4) Backfill dedicated registry from current wines values.
insert into public.suppliers (name)
select distinct trim(supplier) as name
from public.wines
where supplier is not null
  and trim(supplier) <> ''
on conflict (name) do nothing;

commit;
