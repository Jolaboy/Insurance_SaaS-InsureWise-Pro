-- Upgrade policies table for auto + home + bundle and tie policies to quotes
-- Run in Supabase SQL editor (after creating policies table)

-- If your existing policies table is different, adjust these statements accordingly.

alter table public.policies
  add column if not exists product text,
  add column if not exists quote_id uuid references public.quotes(id) on delete set null,
  add column if not exists coverage jsonb not null default '{}'::jsonb,
  add column if not exists monthly_premium_cents integer,
  add column if not exists annual_premium_cents integer,
  add column if not exists currency text default 'GBP',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Constrain product if present
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'policies'
      and column_name = 'product'
  ) then
    begin
      alter table public.policies
        add constraint policies_product_check check (product in ('auto', 'home', 'bundle'));
    exception when duplicate_object then
      null;
    end;
  end if;
end $$;

-- updated_at trigger (reuses public.set_updated_at from earlier SQL)
-- If you didn't create public.set_updated_at yet, create it (see 002_quotes.sql)

drop trigger if exists set_policies_updated_at on public.policies;
create trigger set_policies_updated_at
before update on public.policies
for each row
execute function public.set_updated_at();
