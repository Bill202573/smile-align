-- Drop existing restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Dentists can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Dentists can manage their patients" ON public.patients;

-- Create permissive policies for dentists
CREATE POLICY "Dentists can view all patients"
ON public.patients
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'dentist'::app_role));

CREATE POLICY "Dentists can insert patients"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'dentist'::app_role));

CREATE POLICY "Dentists can update their patients"
ON public.patients
FOR UPDATE
TO authenticated
USING (dentist_id = auth.uid() OR has_role(auth.uid(), 'dentist'::app_role));

CREATE POLICY "Dentists can delete their patients"
ON public.patients
FOR DELETE
TO authenticated
USING (dentist_id = auth.uid());