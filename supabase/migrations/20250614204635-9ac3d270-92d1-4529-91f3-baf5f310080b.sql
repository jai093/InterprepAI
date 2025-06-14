
-- Extend interview_sessions table to include extended AI evaluation and data extraction fields

ALTER TABLE public.interview_sessions
  ADD COLUMN IF NOT EXISTS voice_modulation INTEGER,
  ADD COLUMN IF NOT EXISTS body_language INTEGER,
  ADD COLUMN IF NOT EXISTS problem_solving INTEGER,
  ADD COLUMN IF NOT EXISTS communication_style INTEGER,
  ADD COLUMN IF NOT EXISTS example_usage INTEGER,
  ADD COLUMN IF NOT EXISTS tone_language INTEGER,
  ADD COLUMN IF NOT EXISTS structure INTEGER,
  ADD COLUMN IF NOT EXISTS confidence INTEGER,
  ADD COLUMN IF NOT EXISTS relevance INTEGER,
  ADD COLUMN IF NOT EXISTS clarity INTEGER,
  ADD COLUMN IF NOT EXISTS target_role TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS confidence_score TEXT,
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS interview_overall_score TEXT,
  ADD COLUMN IF NOT EXISTS language_used TEXT,
  ADD COLUMN IF NOT EXISTS email_address TEXT,
  ADD COLUMN IF NOT EXISTS candidate_name TEXT;

-- Also add a field for saving a downloadable report
ALTER TABLE public.interview_sessions
  ADD COLUMN IF NOT EXISTS interview_report_url TEXT;
