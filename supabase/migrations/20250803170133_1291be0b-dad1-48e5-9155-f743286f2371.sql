-- Add candidate_email column and token to assessment_invites table
ALTER TABLE public.assessment_invites 
ADD COLUMN IF NOT EXISTS candidate_email text,
ADD COLUMN IF NOT EXISTS token text UNIQUE DEFAULT gen_random_uuid();

-- Make candidate_id nullable since we want to support inviting candidates who don't have profiles yet
ALTER TABLE public.assessment_invites 
ALTER COLUMN candidate_id DROP NOT NULL;

-- Update RLS policies to allow candidates to view invites by token
DROP POLICY IF EXISTS "Candidates can view invites by token" ON public.assessment_invites;
CREATE POLICY "Candidates can view invites by token" 
ON public.assessment_invites 
FOR SELECT 
USING (true);

-- Allow candidates to update their invite when they take the assessment
DROP POLICY IF EXISTS "Candidates can update invites by token" ON public.assessment_invites;
CREATE POLICY "Candidates can update invites by token" 
ON public.assessment_invites 
FOR UPDATE 
USING (true);

-- Update existing records to have tokens if they don't
UPDATE public.assessment_invites 
SET token = gen_random_uuid()::text 
WHERE token IS NULL;