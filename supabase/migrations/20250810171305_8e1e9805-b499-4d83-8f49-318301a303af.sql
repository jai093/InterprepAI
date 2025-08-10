-- Ensure profiles auto-create on new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill profiles for existing users missing a profile
INSERT INTO public.profiles (id, email, full_name)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Send assessment invite email automatically on insert
DROP TRIGGER IF EXISTS trg_assessment_invite_email ON public.assessment_invites;
CREATE TRIGGER trg_assessment_invite_email
  AFTER INSERT ON public.assessment_invites
  FOR EACH ROW EXECUTE PROCEDURE public.send_assessment_invite_email();

-- Mark invites completed when a submission is inserted
DROP TRIGGER IF EXISTS trg_update_invite_status_on_submission ON public.assessment_submissions;
CREATE TRIGGER trg_update_invite_status_on_submission
  AFTER INSERT ON public.assessment_submissions
  FOR EACH ROW EXECUTE PROCEDURE public.update_invite_status_on_submission();