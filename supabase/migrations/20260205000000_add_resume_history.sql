-- Create resume_history table for storing generated resumes
CREATE TABLE IF NOT EXISTS public.resume_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Personal Information
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  github TEXT,
  linkedin TEXT,
  portfolio TEXT,
  
  -- Job Details
  job_title TEXT NOT NULL,
  job_keywords TEXT[],
  
  -- Resume Content
  skills TEXT[],
  projects JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  
  -- Generated Resume
  resume_text TEXT NOT NULL,
  template_id TEXT DEFAULT 'modern',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.resume_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own resume history"
  ON public.resume_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume history"
  ON public.resume_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume history"
  ON public.resume_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resume history"
  ON public.resume_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_resume_history_user_created 
  ON public.resume_history(user_id, created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resume_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resume_history_updated_at
  BEFORE UPDATE ON public.resume_history
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_history_updated_at();
