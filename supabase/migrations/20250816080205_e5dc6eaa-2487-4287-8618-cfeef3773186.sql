-- Fix critical security vulnerability: Restrict batch_call_sessions access
-- Current policies allow any authenticated user to view all sessions with phone numbers

-- Add initiator_id to track who created the session
ALTER TABLE public.batch_call_sessions 
ADD COLUMN IF NOT EXISTS initiator_id UUID REFERENCES auth.users(id);

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Users can view all batch call sessions" ON public.batch_call_sessions;
DROP POLICY IF EXISTS "Users can insert batch call sessions" ON public.batch_call_sessions;
DROP POLICY IF EXISTS "Users can update batch call sessions" ON public.batch_call_sessions;

-- Create secure RLS policies

-- Policy 1: Users can only view sessions they initiated or where they are the candidate
CREATE POLICY "Users can view their own sessions" 
ON public.batch_call_sessions 
FOR SELECT 
USING (
  auth.uid()::text = candidate_id OR 
  auth.uid() = initiator_id
);

-- Policy 2: Users can only insert sessions for themselves as initiator
CREATE POLICY "Users can create sessions" 
ON public.batch_call_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = initiator_id);

-- Policy 3: Users can only update sessions they initiated
CREATE POLICY "Users can update own sessions" 
ON public.batch_call_sessions 
FOR UPDATE 
USING (auth.uid() = initiator_id);

-- Policy 4: Allow service role to update sessions (for webhook updates)
CREATE POLICY "Service role can update sessions" 
ON public.batch_call_sessions 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Update existing sessions to set initiator_id (if any exist)
-- This is a one-time migration for existing data
UPDATE public.batch_call_sessions 
SET initiator_id = (
  SELECT id FROM auth.users 
  WHERE auth.users.id::text = batch_call_sessions.candidate_id 
  LIMIT 1
)
WHERE initiator_id IS NULL;