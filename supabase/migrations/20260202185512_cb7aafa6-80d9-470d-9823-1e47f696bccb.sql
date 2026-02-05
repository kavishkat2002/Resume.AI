-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  location TEXT,
  professional_summary TEXT,
  github_username TEXT,
  linkedin_headline TEXT,
  linkedin_summary TEXT,
  education JSONB DEFAULT '[]'::jsonb,
  work_experience JSONB DEFAULT '[]'::jsonb,
  skills TEXT[] DEFAULT '{}',
  certifications JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Create jobs table for analyzed job descriptions
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT,
  job_description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  soft_skills TEXT[] DEFAULT '{}',
  experience_level TEXT,
  responsibilities TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for jobs
CREATE POLICY "Users can view their own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Create resumes table
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  template TEXT DEFAULT 'classic',
  content JSONB NOT NULL,
  ats_score INTEGER DEFAULT 0,
  matched_keywords TEXT[] DEFAULT '{}',
  missing_keywords TEXT[] DEFAULT '{}',
  is_draft BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- RLS policies for resumes
CREATE POLICY "Users can view their own resumes"
  ON public.resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
  ON public.resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON public.resumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON public.resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Create applications table for tracking job applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interview', 'offer', 'rejected')),
  applied_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for applications
CREATE POLICY "Users can view their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);

-- Create github_data table for storing analyzed repos
CREATE TABLE public.github_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  repositories JSONB DEFAULT '[]'::jsonb,
  top_languages TEXT[] DEFAULT '{}',
  extracted_skills TEXT[] DEFAULT '{}',
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, username)
);

-- Enable RLS on github_data
ALTER TABLE public.github_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for github_data
CREATE POLICY "Users can view their own github data"
  ON public.github_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own github data"
  ON public.github_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own github data"
  ON public.github_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own github data"
  ON public.github_data FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_github_data_updated_at
  BEFORE UPDATE ON public.github_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();