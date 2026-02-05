-- Create linkedin_analyses table for storing history
CREATE TABLE IF NOT EXISTS public.linkedin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  headline TEXT,
  core_skills TEXT[],
  industry_keywords TEXT[],
  experience_highlights TEXT[],
  missing_keywords TEXT[],
  optimized_summary TEXT,
  improved_bullets TEXT[],
  alignment_score INTEGER,
  recommendations TEXT[],
  matching_jobs JSONB DEFAULT '[]'::jsonb,
  ats_tips TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.linkedin_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own linkedin analyses"
  ON public.linkedin_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own linkedin analyses"
  ON public.linkedin_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own linkedin analyses"
  ON public.linkedin_analyses FOR DELETE
  USING (auth.uid() = user_id);
