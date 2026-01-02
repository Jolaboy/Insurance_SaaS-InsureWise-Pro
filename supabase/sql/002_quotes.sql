-- Quotes table for instant auto/home/bundle quotes
-- Run in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  product text not null check (product in ('auto', 'home', 'bundle')),
  status text not null check (status in ('quoted', 'accepted', 'expired', 'cancelled')) default 'quoted',

  -- Core pricing outputs
  monthly_premium_cents integer not null check (monthly_premium_cents >= 0),
  annual_premium_cents integer not null check (annual_premium_cents >= 0),
  currency text not null default 'GBP',

  -- Store inputs used to price (kept flexible for iteration)
  inputs jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_user_id_idx on public.quotes (user_id);
create index if not exists quotes_user_id_created_at_idx on public.quotes (user_id, created_at desc);
create index if not exists quotes_user_id_status_idx on public.quotes (user_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_quotes_updated_at on public.quotes;
create trigger set_quotes_updated_at
before update on public.quotes
for each row
execute function public.set_updated_at();

alter table public.quotes enable row level security;

drop policy if exists "Users can read own quotes" on public.quotes;
create policy "Users can read own quotes"
on public.quotes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own quotes" on public.quotes;
create policy "Users can create own quotes"
on public.quotes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own quotes" on public.quotes;
create policy "Users can update own quotes"
on public.quotes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Optional: allow delete if you want users to remove quote history.
-- drop policy if exists "Users can delete own quotes" on public.quotes;
-- create policy "Users can delete own quotes"
-- on public.quotes
-- for delete
-- to authenticated
-- using (auth.uid() = user_id);
