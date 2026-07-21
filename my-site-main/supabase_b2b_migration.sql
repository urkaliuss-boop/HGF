-- ============================================
-- B2B Self-Service System — Supabase Migration
-- ============================================
-- Выполните этот SQL в Supabase Dashboard → SQL Editor

-- 1. Таблица заказов бизнес-клиентов
create table if not exists business_orders (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  platform text not null,
  target_link text not null,
  review_count int not null,
  instructions text,
  price_per_review int not null,
  total_price int not null,
  completed_count int default 0,
  status text default 'active',
  created_at timestamptz default now()
);

-- 2. Привязка заданий к заказу (новая колонка в tasks)
alter table tasks add column if not exists business_order_id bigint references business_orders(id);

-- 3. RLS (Row Level Security) для business_orders
alter table business_orders enable row level security;

-- Бизнес-пользователь видит только свои заказы
create policy "Users can view own orders"
  on business_orders for select
  using (auth.uid() = user_id);

-- Бизнес-пользователь может создавать заказы
create policy "Users can create orders"
  on business_orders for insert
  with check (auth.uid() = user_id);

-- Бизнес-пользователь может обновлять свои заказы (отмена)
create policy "Users can update own orders"
  on business_orders for update
  using (auth.uid() = user_id);

-- Админ видит всё
create policy "Admin full access"
  on business_orders for all
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );
