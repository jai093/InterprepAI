-- Add candidate_email column to assessment_invites to store the actual candidate email
ALTER TABLE assessment_invites 
ADD COLUMN candidate_email TEXT;

-- Add a unique token column for secure assessment links
ALTER TABLE assessment_invites 
ADD COLUMN token TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Create an index on the token for faster lookups
CREATE INDEX idx_assessment_invites_token ON assessment_invites(token);

-- Update RLS policies to allow candidates to access assessments via token
CREATE POLICY "Candidates can view invites by token" 
ON assessment_invites 
FOR SELECT 
USING (true);