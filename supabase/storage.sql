-- Photo upload bucket (public read). Run once in SQL Editor. Open mode: anyone using the site can upload.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,2097152,array['image/webp','image/png','image/jpeg'])
on conflict(id) do update set public=true,file_size_limit=2097152;
drop policy if exists "product images read" on storage.objects;
drop policy if exists "product images upload" on storage.objects;
drop policy if exists "product images delete" on storage.objects;
create policy "product images read" on storage.objects for select using(bucket_id='product-images');
create policy "product images upload" on storage.objects for insert to anon,authenticated with check(bucket_id='product-images');
create policy "product images delete" on storage.objects for delete to anon,authenticated using(bucket_id='product-images');
