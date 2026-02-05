-- Add unique constraint on user_id for github_data table to support upsert
ALTER TABLE public.github_data 
ADD CONSTRAINT github_data_user_id_unique UNIQUE (user_id);
