-- Allow recruiters to view candidate profiles for invitations
CREATE POLICY "Recruiters can view profiles for invitations" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.recruiters 
      WHERE recruiters.id = auth.uid()
    )
  )
);