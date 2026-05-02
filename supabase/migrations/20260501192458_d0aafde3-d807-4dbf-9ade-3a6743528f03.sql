insert into storage.buckets (id, name, public) values ('assets', 'assets', true) on conflict (id) do update set public = true;

create policy "Public read assets" on storage.objects for select using (bucket_id = 'assets');
create policy "Authenticated upload assets" on storage.objects for insert to authenticated with check (bucket_id = 'assets');