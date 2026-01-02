-- Allow users to insert their own role during signup
CREATE POLICY "Users can insert own role during signup"
ON public.user_roles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow dentists to view all roles (needed for patient management)
CREATE POLICY "Dentists can view all roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'dentist'::app_role));