-- Storage bucket setup for file uploads
-- Note: This creates the bucket, but you may need to set up policies in Supabase dashboard

-- Create storage bucket for activity files
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-files', 'activity-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'activity-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view files they can access" ON storage.objects
FOR SELECT USING (
    bucket_id = 'activity-files' AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        EXISTS (
            SELECT 1 FROM users u1, users u2
            WHERE u1.id = auth.uid()
            AND u2.id = (storage.foldername(name))[1]::uuid
            AND u1.category IN ('HOD', 'CEO', 'AG')
            AND (u1.category = 'AG' OR u1.department_saga_id = u2.department_saga_id)
        )
    )
);
