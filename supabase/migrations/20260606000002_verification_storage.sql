-- Migration to create verification_documents bucket and policies

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification_documents', 'verification_documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification_documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Allow users to read their own documents
CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification_documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. Allow superadmins to read all documents
-- We need to check the home_masjid.user_profiles table
CREATE POLICY "Superadmins can view all verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification_documents' AND
  EXISTS (
    SELECT 1 FROM home_masjid.user_profiles
    WHERE id = auth.uid() AND is_superadmin = true
  )
);
