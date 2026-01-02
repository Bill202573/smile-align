-- Create notifications table for patient notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'pause_released', 'info', 'warning'
  related_arch TEXT, -- 'upper', 'lower', or null
  dentist_observation TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Patients can view their own notifications
CREATE POLICY "Patients can view own notifications"
ON public.notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    JOIN profiles pr ON pr.email = p.email
    WHERE p.id = notifications.patient_id
    AND pr.user_id = auth.uid()
  )
);

-- Patients can update their own notifications (mark as read)
CREATE POLICY "Patients can update own notifications"
ON public.notifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM patients p
    JOIN profiles pr ON pr.email = p.email
    WHERE p.id = notifications.patient_id
    AND pr.user_id = auth.uid()
  )
);

-- Dentists can insert notifications for their patients
CREATE POLICY "Dentists can insert notifications for their patients"
ON public.notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = notifications.patient_id
    AND patients.dentist_id = auth.uid()
  )
);

-- Dentists can view notifications for their patients
CREATE POLICY "Dentists can view notifications for their patients"
ON public.notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = notifications.patient_id
    AND patients.dentist_id = auth.uid()
  )
);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications"
ON public.notifications FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));