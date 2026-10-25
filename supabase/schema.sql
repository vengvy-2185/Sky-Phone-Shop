-- SKY PHONE SHOP — run whole file in Supabase → SQL Editor
create extension if not exists pgcrypto;

create table if not exists public.products(
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());

create table if not exists public.product_variants(
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage text not null,
  price numeric(10,2) not null check(price>=0),          -- normal selling price (for ranges: = price_min)
  price_min numeric(10,2) check(price_min>=0),            -- original range, kept as supplied
  price_max numeric(10,2) check(price_max>=0),
  preorder_price numeric(10,2) check(preorder_price>=0),  -- entered manually, never calculated
  stock_qty integer not null default 0 check(stock_qty>=0),
  image_url text,
  condition text check(condition in ('New','Used')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id,storage),
  check(price_max is null or price_min is null or price_max>=price_min));

create table if not exists public.inventory_adjustments(
  id bigint generated always as identity primary key,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  delta integer not null, old_qty integer not null, new_qty integer not null,
  reason text, created_by uuid, created_at timestamptz not null default now());

create table if not exists public.managers(user_id uuid primary key references auth.users(id) on delete cascade);

create index if not exists idx_variants_product on public.product_variants(product_id);
create index if not exists idx_variants_stock on public.product_variants(stock_qty);
create index if not exists idx_variants_updated on public.product_variants(updated_at desc);
create index if not exists idx_adj_variant on public.inventory_adjustments(variant_id,created_at desc);

-- updated_at
create or replace function public.touch() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;
drop trigger if exists t_products_touch on public.products;
create trigger t_products_touch before update on public.products for each row execute function public.touch();
drop trigger if exists t_variants_touch on public.product_variants;
create trigger t_variants_touch before update on public.product_variants for each row execute function public.touch();

-- manager check
create or replace function public.is_manager() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.managers where user_id=auth.uid()) $$;

-- automatic stock history
create or replace function public.log_stock() returns trigger language plpgsql security definer set search_path=public as $$
declare o int := case when tg_op='INSERT' then 0 else old.stock_qty end;
begin
  if new.stock_qty<>o then
    insert into public.inventory_adjustments(variant_id,delta,old_qty,new_qty,reason,created_by)
    values(new.id,new.stock_qty-o,o,new.stock_qty,coalesce(nullif(current_setting('app.reason',true),''),'edit'),auth.uid());
  end if; return new; end $$;
drop trigger if exists t_variants_log on public.product_variants;
create trigger t_variants_log after insert or update on public.product_variants for each row execute function public.log_stock();

-- +/- buttons: never goes below 0
create or replace function public.adjust_stock(p_variant uuid,p_delta int,p_reason text default 'manual') returns int
language plpgsql security definer set search_path=public as $$
declare n int;
begin
  if not public.is_manager() then raise exception 'not authorized'; end if;
  perform set_config('app.reason',coalesce(p_reason,'manual'),true);
  update public.product_variants set stock_qty=greatest(0,stock_qty+p_delta) where id=p_variant returning stock_qty into n;
  return n; end $$;
revoke all on function public.adjust_stock(uuid,int,text) from public, anon;
grant execute on function public.adjust_stock(uuid,int,text) to authenticated;

-- Row Level Security: public read-only, managers write
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_adjustments enable row level security;
alter table public.managers enable row level security;  -- no policies = unreachable from the API
drop policy if exists "public read products" on public.products;
drop policy if exists "managers write products" on public.products;
drop policy if exists "public read variants" on public.product_variants;
drop policy if exists "managers write variants" on public.product_variants;
drop policy if exists "managers read history" on public.inventory_adjustments;
create policy "public read products" on public.products for select using(true);
create policy "managers write products" on public.products for all to authenticated using(public.is_manager()) with check(public.is_manager());
create policy "public read variants" on public.product_variants for select using(true);
create policy "managers write variants" on public.product_variants for all to authenticated using(public.is_manager()) with check(public.is_manager());
create policy "managers read history" on public.inventory_adjustments for select to authenticated using(public.is_manager());

-- Realtime
do $$ begin alter publication supabase_realtime add table public.product_variants; exception when duplicate_object then null; end $$;

-- Seed (reference prices; stock = 0; no invented preorder prices or images)
insert into public.products(name,sort_order) values
('iPhone SE',1),('iPhone 11',2),('iPhone 12',3),('iPhone 12 Pro',4),('iPhone 12 Pro Max',5),('iPhone 13',6),('iPhone 13 Pro',7),
('iPhone 13 Pro Max',8),('iPhone 14',9),('iPhone 14 Pro',10),('iPhone 14 Pro Max',11),('iPhone 15 Pro',12),('iPhone 15 Pro Max',13),
('iPhone 16 Pro Max',14),('iPhone 17 Pro Max',15),('iPhone 18 Pro Max',16) on conflict(name) do nothing;

insert into public.product_variants(product_id,storage,price,price_min,price_max,condition,notes)
select p.id,v.storage,v.price,v.mn,v.mx,v.cond,v.notes from (values
('iPhone SE','64GB',65::numeric,null::numeric,null::numeric,null::text,null::text),
('iPhone 11','64GB',159,null,null,null,null),
('iPhone 12','64GB',210,null,null,null,null),
('iPhone 12 Pro','128GB',290,null,null,null,null),
('iPhone 12 Pro Max','128GB',360,null,null,null,null),
('iPhone 13','128GB',290,290,310,null,null),
('iPhone 13 Pro','128GB',399,null,null,null,null),
('iPhone 13 Pro Max','128GB',460,null,null,null,null),
('iPhone 14','128GB',340,null,null,null,null),
('iPhone 14 Pro','128GB',430,430,490,null,null),
('iPhone 14 Pro Max','128GB',480,480,500,null,null),
('iPhone 15 Pro','128GB',550,null,null,null,null),
('iPhone 15 Pro Max','256GB',695,695,720,null,'Supplied range $695–$720 shared by 256GB/512GB; set each price'),
('iPhone 15 Pro Max','512GB',695,695,720,null,'Supplied range $695–$720 shared by 256GB/512GB; set each price'),
('iPhone 16 Pro Max','256GB',820,null,null,null,null),
('iPhone 17 Pro Max','256GB',1250,null,null,null,null),
('iPhone 18 Pro Max','256GB',1580,null,null,'New','New')
) as v(name,storage,price,mn,mx,cond,notes) join public.products p on p.name=v.name
on conflict(product_id,storage) do nothing;

-- After creating your manager user (Authentication → Users), run:
-- insert into public.managers(user_id) select id from auth.users where email='YOU@example.com';
