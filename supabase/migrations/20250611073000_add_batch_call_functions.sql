
-- Create a function to get batch call sessions
CREATE OR REPLACE FUNCTION get_batch_call_sessions()
RETURNS TABLE (
  id uuid,
  candidate_id text,
  phone_number text,
  voice_id text,
  prompts text[],
  audio_urls text[],
  status text,
  callback_url text,
  webhook_data jsonb,
  created_at timestamp with time zone,
  completed_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    candidate_id,
    phone_number,
    voice_id,
    prompts,
    audio_urls,
    status,
    callback_url,
    webhook_data,
    created_at,
    completed_at
  FROM public.batch_call_sessions
  ORDER BY created_at DESC;
$$;
