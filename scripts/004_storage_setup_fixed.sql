-- Create storage bucket for activity files (simplified version)
-- Note: This may need to be done through Supabase dashboard if permissions are insufficient

-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('activity-files', 'activity-files', false)
on conflict (id) do nothing;

-- Create storage policies
create policy "Users can upload their own files" on storage.objects
    for insert with check (
        bucket_id = 'activity-files' and
        auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Users can view files they have access to" on storage.objects
    for select using (
        bucket_id = 'activity-files' and (
            auth.uid()::text = (storage.foldername(name))[1] or
            exists (
                select 1 from users
                where users.id::text = auth.uid()::text
                and users.role in ('hod_ceo', 'ag')
            )
        )
    );
