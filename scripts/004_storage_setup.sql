-- Create storage bucket for activity documents
INSERT INTO storage.buckets (id, name, public) VALUES ('activity-documents', 'activity-documents', false);

-- Storage policies for activity documents
CREATE POLICY "Users can upload their own activity documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'activity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own activity documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'activity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- HOD/CEO can view documents from their department/saga officers
CREATE POLICY "HOD/CEO can view department documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'activity-documents' 
  AND EXISTS (
    SELECT 1 FROM users u1
    JOIN users u2 ON u2.id::text = (storage.foldername(name))[1]
    WHERE u1.id = auth.uid() 
    AND u1.role = 'hod_ceo'
    AND u1.department_or_saga_id = u2.department_or_saga_id
  )
);

-- AG can view all documents
CREATE POLICY "AG can view all documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'activity-documents' 
  AND EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'ag'
  )
);
