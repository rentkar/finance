-- Enable pgcrypto extension
create extension if not exists "pgcrypto";

-- Create purchases table
create table if not exists public.purchases (
  id uuid default gen_random_uuid() primary key,
  uploader_name text not null,
  vendor_name text not null,
  purpose text not null check (purpose in ('Procurement', 'Salary', 'Repair', 'Small Purchase')),
  amount numeric not null,
  file_url text,
  file_name text,
  status text not null default 'pending' check (status in ('pending', 'director_approved', 'finance_approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  payment_date timestamp with time zone not null,
  payment_sequence text not null check (payment_sequence in ('payment_first', 'bill_first', 'payment_without_bill')),
  bill_type text not null check (bill_type in ('quantum', 'covalent')),
  hub text not null check (hub in ('mumbai', 'delhi', 'bangalore', 'pune')),
  director_approval jsonb,
  finance_approval jsonb
);

-- Enable Row Level Security
alter table public.purchases enable row level security;

-- Create policies
create policy "Enable read access for all users"
on purchases for select
using (true);

create policy "Enable insert for all users"
on purchases for insert
with check (true);

create policy "Enable update for all users"
on purchases for update
using (true);

-- Storage setup
insert into storage.buckets (id, name, public)
values ('bills', 'bills', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public access to bills"
on storage.objects for select
using (bucket_id = 'bills');

create policy "Allow upload to bills"
on storage.objects for insert
with check (bucket_id = 'bills');

create policy "Allow update to bills"
on storage.objects for update
using (bucket_id = 'bills');

create policy "Allow delete from bills"
on storage.objects for delete
using (bucket_id = 'bills');