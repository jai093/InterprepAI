-- Fix the remaining function search path
CREATE OR REPLACE FUNCTION public.get_batch_call_sessions()
RETURNS SETOF batch_call_sessions
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT * FROM public.batch_call_sessions
  ORDER BY created_at DESC;
$function$;