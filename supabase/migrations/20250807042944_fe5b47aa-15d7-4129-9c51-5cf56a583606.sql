-- Add email template support for assessment invites
CREATE OR REPLACE FUNCTION public.send_assessment_invite_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assessment_title text;
  recruiter_email text;
  recruiter_name text;
BEGIN
  -- Get assessment details
  SELECT title INTO assessment_title
  FROM assessments
  WHERE id = NEW.assessment_id;
  
  -- Get recruiter details
  SELECT email, name INTO recruiter_email, recruiter_name
  FROM recruiters
  WHERE id = NEW.recruiter_id;
  
  -- Call edge function to send email
  PERFORM
    net.http_post(
      url := 'https://mybjsygfhrzzknwalyov.supabase.co/functions/v1/send-assessment-invite',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key', true) || '"}'::jsonb,
      body := json_build_object(
        'candidate_email', NEW.candidate_email,
        'assessment_title', assessment_title,
        'recruiter_name', recruiter_name,
        'recruiter_email', recruiter_email,
        'invite_link', NEW.link,
        'invite_id', NEW.id::text
      )::text
    );
  
  RETURN NEW;
END;
$function$;

-- Create trigger to send email when assessment invite is created
CREATE TRIGGER send_assessment_invite_email_trigger
  AFTER INSERT ON public.assessment_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.send_assessment_invite_email();