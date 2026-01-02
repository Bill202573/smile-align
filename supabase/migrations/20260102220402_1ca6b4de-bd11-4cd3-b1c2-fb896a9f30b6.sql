-- Create table for dentist notifications (when patients read their messages)
CREATE TABLE public.dentist_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dentist_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  notification_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dentist_notifications ENABLE ROW LEVEL SECURITY;

-- Dentists can view their own notifications
CREATE POLICY "Dentists can view own notifications"
ON public.dentist_notifications
FOR SELECT
USING (dentist_id = auth.uid());

-- Dentists can update their own notifications
CREATE POLICY "Dentists can update own notifications"
ON public.dentist_notifications
FOR UPDATE
USING (dentist_id = auth.uid());

-- Allow inserting dentist notifications (for when patients confirm read)
CREATE POLICY "Allow insert dentist notifications"
ON public.dentist_notifications
FOR INSERT
WITH CHECK (true);

-- Admins can manage all
CREATE POLICY "Admins can manage all dentist notifications"
ON public.dentist_notifications
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));