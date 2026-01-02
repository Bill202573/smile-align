-- Fix privilege escalation: users can only self-assign 'patient' during signup
DROP POLICY IF EXISTS "Users can insert own role during signup" ON public.user_roles;

CREATE POLICY "Users can insert own patient role during signup"
ON public.user_roles
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND role = 'patient'::app_role
);

-- Ensure profiles can be created from the client after signup (no triggers on auth schema)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());
