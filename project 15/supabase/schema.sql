-- Drop existing tables and policies if they exist
drop policy if exists "Enable read access for all users" on public.purchases;
drop policy if exists "Enable insert for all users" on public.purchases;
drop policy if exists "Enable update for all users" on public.purchases;
drop policy if exists "Enable delete for all users" on public.purchases;
drop table if exists public.purchases;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create purchases table
create table public.purchases (
    id uuid default uuid_generate_v4() primary key,
    uploader_name varchar(255) not null,
    vendor_name varchar(255) not null,
    purpose varchar(50) not null,
    amount decimal(15,2) not null check (amount >= 0),
    file_url text,
    file_name varchar(255),
    status varchar(20) not null default 'pending',
    created_at timestamptz default now() not null,
    payment_date timestamptz not null,
    payment_sequence varchar(50) not null,
    bill_type varchar(50) not null,
    hub varchar(50) not null,
    director_approval jsonb default null,
    finance_approval jsonb default null,

    constraint valid_purpose check (
        purpose in ('Procurement', 'Salary', 'Repair', 'Small Purchase')
    ),
    constraint valid_status check (
        status in ('pending', 'director_approved', 'finance_approved', 'rejected')
    ),
    constraint valid_payment_sequence check (
        payment_sequence in ('payment_first', 'bill_first', 'payment_without_bill')
    ),
    constraint valid_bill_type check (
        bill_type in ('quantum', 'covalent')
    ),
    constraint valid_hub check (
        hub in ('mumbai', 'delhi', 'bangalore', 'pune')
    )
);

-- Create indexes
create index idx_purchases_created_at on public.purchases(created_at desc);
create index idx_purchases_status on public.purchases(status);
create index idx_purchases_hub on public.purchases(hub);
create index idx_purchases_amount on public.purchases(amount);

-- Enable RLS
alter table public.purchases enable row level security;

-- Create policies
create policy "Enable read access for all users"
    on public.purchases for select
    using (true);

create policy "Enable insert for all users"
    on public.purchases for insert
    with check (true);

create policy "Enable update for all users"
    on public.purchases for update
    using (true);

create policy "Enable delete for all users"
    on public.purchases for delete
    using (true);

-- Storage policies
drop policy if exists "Enable read access for all users" on storage.objects;
drop policy if exists "Enable insert for all users" on storage.objects;

create policy "Enable read access for all users"
    on storage.objects for select
    using (true);

create policy "Enable insert for all users"
    on storage.objects for insert
    with check (true);

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all privileges on public.purchases to anon, authenticated;