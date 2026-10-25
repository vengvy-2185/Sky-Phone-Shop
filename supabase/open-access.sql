-- OPEN ACCESS (no login): anyone who opens the site can edit prices and stock.
-- Run AFTER schema.sql. To go back to manager-only, run the REVERT block at the bottom.
drop policy if exists "open write products" on public.products;
drop policy if exists "open write variants" on public.product_variants;
drop policy if exists "open read history" on public.inventory_adjustments;
create policy "open write products" on public.products for all to anon,authenticated using(true) with check(true);
create policy "open write variants" on public.product_variants for all to anon,authenticated using(true) with check(true);
create policy "open read history" on public.inventory_adjustments for select to anon,authenticated using(true);
create or replace function public.adjust_stock(p_variant uuid,p_delta int,p_reason text default 'manual') returns int
language plpgsql security definer set search_path=public as $$
declare n int;
begin
  perform set_config('app.reason',coalesce(p_reason,'manual'),true);
  update public.product_variants set stock_qty=greatest(0,stock_qty+p_delta) where id=p_variant returning stock_qty into n;
  return n; end $$;
grant execute on function public.adjust_stock(uuid,int,text) to anon,authenticated;

-- REVERT (manager-only again):
-- drop policy "open write products" on public.products;
-- drop policy "open write variants" on public.product_variants;
-- drop policy "open read history" on public.inventory_adjustments;
-- revoke execute on function public.adjust_stock(uuid,int,text) from anon;
-- (then re-run the adjust_stock function from schema.sql to restore the manager check)
