-- Add resume_history_id to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS resume_history_id UUID REFERENCES public.resume_history(id) ON DELETE SET NULL;

-- Keep resume_id optional
ALTER TABLE public.applications
ALTER COLUMN resume_id DROP NOT NULL;

-- Ensure job_id is present (it already is in the schema)
