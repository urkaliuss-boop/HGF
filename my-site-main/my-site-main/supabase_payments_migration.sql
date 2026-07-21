-- ============================================
-- YooKassa Payments — Supabase Migration
-- ============================================
-- Выполните в Supabase Dashboard → SQL Editor

-- 1. Таблица платежей
create table if not exists payments (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  amount int not null,
  yookassa_id text,
  status text default 'pending',  -- pending / succeeded / cancelled
  created_at timestamptz default now()
);

-- 2. RLS
alter table payments enable row level security;

create policy "Users view own payments"
  on payments for select
  using (auth.uid() = user_id);

create policy "Service can insert payments"
  on payments for insert
  with check (true);

create policy "Service can update payments"
  on payments for update
  using (true);
