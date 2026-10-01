alter table public.orders
  add column if not exists is_delivered boolean not null default false,
  add column if not exists delivered_at timestamptz;

notify pgrst, 'reload schema';