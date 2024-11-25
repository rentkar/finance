-- Enable RLS
create extension if not exists "pgcrypto";

-- Create purchases table if not exists
create table if not exists public.purchases (
  id uuid default gen_random_uuid() primary key,
  uploader_name text not null,
  vendor_name text not null,
  purpose text not null,
  amount numeric not null,
  file_url text,
  file_name text,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  payment_date timestamp with time zone not null,
  payment_sequence text not null,
  bill_type text not null,
  hub text not null,
  director_approval jsonb,
  finance_approval jsonb
);

-- Enable RLS
alter table public.purchases enable row level security;

-- Create or replace policies for purchases table
drop policy if exists "Enable read access for all users" on purchases;
drop policy if exists "Enable insert access for all users" on purchases;
drop policy if exists "Enable update access for all users" on purchases;

create policy "Enable read access for all users" 
on public.purchases for select 
using (true);

create policy "Enable insert access for all users" 
on public.purchases for insert 
with check (true);

create policy "Enable update access for all users" 
on public.purchases for update 
using (true);

-- Create storage bucket if not exists
insert into storage.buckets (id, name, public)
values ('bills', 'bills', true)
on conflict (id) do nothing;

-- Drop existing storage policies if they exist
begin;
  drop policy if exists "Public access to bills" on storage.objects;
  drop policy if exists "Allow upload to bills" on storage.objects;
  drop policy if exists "Allow update to bills" on storage.objects;
  drop policy if exists "Allow delete from bills" on storage.objects;
commit;

-- Create new storage policies
begin;
  create policy "Public access to bills"
  on storage.objects for select
  using ( bucket_id = 'bills' );

  create policy "Allow upload to bills"
  on storage.objects for insert
  with check ( bucket_id = 'bills' );

  create policy "Allow update to bills"
  on storage.objects for update
  using ( bucket_id = 'bills' );

  create policy "Allow delete from bills"
  on storage.objects for delete
  using ( bucket_id = 'bills' );
commit;