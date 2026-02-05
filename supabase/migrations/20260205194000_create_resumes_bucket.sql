-- Create the 'resumes' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the 'resumes' bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'resumes' );

CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'resumes' AND auth.uid() = owner );

CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'resumes' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'resumes' AND auth.uid() = owner );
