-- Add manual_resume_url to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS manual_resume_url TEXT;

-- Verify the column was added (optional, for safety)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'manual_resume_url') THEN
        RAISE EXCEPTION 'Column manual_resume_url was not added successfully';
    END IF;
END $$;
