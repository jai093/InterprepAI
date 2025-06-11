
-- Update the get_batch_call_sessions function to properly return the expected type
DROP FUNCTION IF EXISTS get_batch_call_sessions();

CREATE OR REPLACE FUNCTION get_batch_call_sessions()
RETURNS SETOF batch_call_sessions
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.batch_call_sessions
  ORDER BY created_at DESC;
$$;
