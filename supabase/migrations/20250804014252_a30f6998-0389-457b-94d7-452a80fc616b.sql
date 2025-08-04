-- Add interview data storage to assessment_submissions table
ALTER TABLE public.assessment_submissions 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS transcript JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT 0;

-- Update RLS policies to allow candidates to insert their own submissions
CREATE POLICY "Candidates can insert their own submissions" 
ON public.assessment_submissions 
FOR INSERT 
WITH CHECK (candidate_id = auth.uid());

-- Add trigger to update invite status when submission is created
CREATE OR REPLACE FUNCTION public.update_invite_status_on_submission()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.assessment_invites 
  SET status = 'completed', completed_at = NOW()
  WHERE id = NEW.invite_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invite_status_trigger
  AFTER INSERT ON public.assessment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invite_status_on_submission();