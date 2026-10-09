-- SurakshaOps application records.
-- Stores the existing frontend record shapes without forcing a risky UI rewrite.
create table if not exists public.app_records (
  id uuid primary key default gen_random_uuid(),
  collection_key text not null check (collection_key in ('employees','equipment','hazards','incidents','handovers','logs','settings')),
  record_id text not null,
  data jsonb not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (collection_key, record_id)
);

alter table public.app_records enable row level security;

-- Authenticated users can read shared operational records.
drop policy if exists "Authenticated users can read app records" on public.app_records;
create policy "Authenticated users can read app records"
  on public.app_records for select to authenticated using (true);

-- Authenticated users can create/update records; app role restrictions should
-- be tightened once the role matrix is finalized and tested.
drop policy if exists "Authenticated users can insert app records" on public.app_records;
create policy "Authenticated users can insert app records"
  on public.app_records for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update app records" on public.app_records;
create policy "Authenticated users can update app records"
  on public.app_records for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can delete app records" on public.app_records;
create policy "Authenticated users can delete app records"
  on public.app_records for delete to authenticated using (true);

grant select, insert, update, delete on public.app_records to authenticated;
