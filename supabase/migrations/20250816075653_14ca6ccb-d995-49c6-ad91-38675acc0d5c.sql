-- Fix critical security vulnerability: Restrict recruiter table access
-- Current policy allows all authenticated users to read all recruiter data

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Recruiters manage own" ON public.recruiters;

-- Policy 1: Recruiters can manage their own data
CREATE POLICY "Recruiters can manage their own data" 
ON public.recruiters 
FOR ALL 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 2: Users can view recruiters who have sent them assessment invites
CREATE POLICY "Users can view recruiters who invited them - assessments" 
ON public.recruiters 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.assessment_invites ai 
    WHERE ai.recruiter_id = recruiters.id 
    AND ai.candidate_id = auth.uid()
  )
);

-- Policy 3: Users can view recruiters who have sent them interview invites  
CREATE POLICY "Users can view recruiters who invited them - interviews"
ON public.recruiters
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.interview_invites ii
    WHERE ii.recruiter_id = recruiters.id 
    AND ii.user_id = auth.uid()
  )
);

-- Policy 4: Allow shortlisting functionality to access recruiters
-- Create a security definer function for auto-shortlist feature
CREATE OR REPLACE FUNCTION public.get_all_recruiters_for_shortlist()
RETURNS SETOF public.recruiters
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.recruiters;
$$;

-- Grant execute permission to authenticated users (for auto-shortlist feature)
GRANT EXECUTE ON FUNCTION public.get_all_recruiters_for_shortlist() TO authenticated;