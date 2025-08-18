-- Fix security vulnerabilities in profiles and interview data access

-- Drop the overly permissive profile policy
DROP POLICY IF EXISTS "Recruiters can view profiles for invitations" ON public.profiles;

-- Create a more restrictive policy for recruiters to view profiles
-- Only allow recruiters to view profiles of candidates who have:
-- 1. Been invited to their assessments
-- 2. Been invited to their interviews  
-- 3. Been shortlisted by them
CREATE POLICY "Recruiters can view invited candidate profiles" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR (
    EXISTS (
      SELECT 1 FROM public.recruiters 
      WHERE recruiters.id = auth.uid()
    ) AND (
      -- Can view profiles of candidates invited to their assessments
      EXISTS (
        SELECT 1 FROM public.assessment_invites ai
        WHERE ai.recruiter_id = auth.uid() 
        AND ai.candidate_id = profiles.id
      ) OR
      -- Can view profiles of candidates invited to their interviews
      EXISTS (
        SELECT 1 FROM public.interview_invites ii
        WHERE ii.recruiter_id = auth.uid() 
        AND ii.user_id = profiles.id
      ) OR
      -- Can view profiles of candidates they have shortlisted
      EXISTS (
        SELECT 1 FROM public.shortlistings s
        WHERE s.recruiter_id = auth.uid() 
        AND s.user_id = profiles.id
      )
    )
  )
);

-- Add additional security for interview_sessions table
-- Create a policy to allow recruiters to view interview sessions of their invited candidates
DROP POLICY IF EXISTS "Recruiters can view invited candidate interviews" ON public.interview_sessions;

CREATE POLICY "Recruiters can view invited candidate interviews" ON public.interview_sessions
FOR SELECT USING (
  auth.uid() = user_id OR (
    EXISTS (
      SELECT 1 FROM public.recruiters 
      WHERE recruiters.id = auth.uid()
    ) AND (
      -- Can view interview sessions of candidates invited to their assessments
      EXISTS (
        SELECT 1 FROM public.assessment_invites ai
        WHERE ai.recruiter_id = auth.uid() 
        AND ai.candidate_id = interview_sessions.user_id
      ) OR
      -- Can view interview sessions of candidates invited to their interviews
      EXISTS (
        SELECT 1 FROM public.interview_invites ii
        WHERE ii.recruiter_id = auth.uid() 
        AND ii.user_id = interview_sessions.user_id
      ) OR
      -- Can view interview sessions of candidates they have shortlisted
      EXISTS (
        SELECT 1 FROM public.shortlistings s
        WHERE s.recruiter_id = auth.uid() 
        AND s.user_id = interview_sessions.user_id
      )
    )
  )
);

-- Add comment explaining the security measures
COMMENT ON POLICY "Recruiters can view invited candidate profiles" ON public.profiles IS 
'Restricts recruiter access to only view profiles of candidates they have specifically invited to assessments, interviews, or shortlisted. Prevents harvesting of personal contact information.';

COMMENT ON POLICY "Recruiters can view invited candidate interviews" ON public.interview_sessions IS 
'Allows recruiters to view interview data only for candidates they have invited or shortlisted, preventing unauthorized access to sensitive interview performance data.';