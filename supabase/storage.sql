insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view menu images" on storage.objects;
create policy "Public can view menu images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'menu-images');

drop policy if exists "Admins upload menu images" on storage.objects;
create policy "Admins upload menu images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'menu-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "Admins update menu images" on storage.objects;
create policy "Admins update menu images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'menu-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    bucket_id = 'menu-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "Admins delete menu images" on storage.objects;
create policy "Admins delete menu images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'menu-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
