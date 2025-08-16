-- Fix critical security vulnerability: Remove overly permissive RLS policies
-- that expose candidate email addresses to all authenticated users

-- Drop the problematic policies that use "USING (true)"
DROP POLICY IF EXISTS "Candidates can view invites by token" ON public.assessment_invites;
DROP POLICY IF EXISTS "Candidates can update invites by token" ON public.assessment_invites;

-- Create a secure function to validate token-based access
CREATE OR REPLACE FUNCTION public.get_invite_by_token(invite_token text)
RETURNS TABLE (
  id uuid,
  assessment_id uuid,
  recruiter_id uuid,
  candidate_id uuid,
  created_at timestamptz,
  completed_at timestamptz,
  link text,
  status text,
  candidate_email text,
  token text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ai.id,
    ai.assessment_id,
    ai.recruiter_id,
    ai.candidate_id,
    ai.created_at,
    ai.completed_at,
    ai.link,
    ai.status,
    ai.candidate_email,
    ai.token
  FROM assessment_invites ai
  WHERE ai.token = invite_token;
$$;

-- Create a secure function to update invite status by token
CREATE OR REPLACE FUNCTION public.update_invite_by_token(
  invite_token text,
  new_candidate_id uuid DEFAULT NULL,
  new_status text DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE assessment_invites 
  SET 
    candidate_id = COALESCE(new_candidate_id, candidate_id),
    status = COALESCE(new_status, status),
    completed_at = CASE 
      WHEN new_status = 'completed' THEN NOW() 
      ELSE completed_at 
    END
  WHERE token = invite_token;
  
  SELECT FOUND;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_invite_by_token(text, uuid, text) TO authenticated;