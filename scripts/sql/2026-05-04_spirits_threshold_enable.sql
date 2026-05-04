-- Enable thresholds for existing spirits_products tables
-- Run this only if spirits_products already exists without the threshold column.

begin;

alter table public.spirits_products
  add column if not exists threshold integer;

alter table public.spirits_products
  drop constraint if exists spirits_products_threshold_check;

alter table public.spirits_products
  add constraint spirits_products_threshold_check
  check (threshold is null or (threshold >= 1 and threshold <= 99));

create index if not exists idx_spirits_products_threshold
  on public.spirits_products(threshold);

commit;
