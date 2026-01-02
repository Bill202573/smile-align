-- Drop the restrictive INSERT policy for dentists
DROP POLICY IF EXISTS "Dentists can insert notifications for their patients" ON public.notifications;

-- Create a more permissive INSERT policy for dentists
CREATE POLICY "Dentists can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'dentist'::app_role));