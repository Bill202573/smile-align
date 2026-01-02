-- Add provisional_password column to patients table
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS provisional_password text;

-- Add avatar_url column to patients table for profile photo
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create aligner_deliveries table for tracking batch deliveries by dentist
CREATE TABLE IF NOT EXISTS public.aligner_deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  upper_from integer NOT NULL DEFAULT 0,
  upper_to integer NOT NULL DEFAULT 0,
  lower_from integer NOT NULL DEFAULT 0,
  lower_to integer NOT NULL DEFAULT 0,
  delivered_by uuid REFERENCES auth.users(id),
  delivered_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text
);

-- Enable RLS on aligner_deliveries
ALTER TABLE public.aligner_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS policies for aligner_deliveries
CREATE POLICY "Admins can manage all deliveries"
  ON public.aligner_deliveries
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Dentists can manage deliveries for their patients"
  ON public.aligner_deliveries
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = aligner_deliveries.patient_id
    AND patients.dentist_id = auth.uid()
  ));

CREATE POLICY "Patients can view own deliveries"
  ON public.aligner_deliveries
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM patients p
    JOIN profiles pr ON pr.email = p.email
    WHERE p.id = aligner_deliveries.patient_id
    AND pr.user_id = auth.uid()
  ));

-- Create storage bucket for patient photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-photos', 'patient-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for patient-photos bucket
CREATE POLICY "Anyone can view patient photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'patient-photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'patient-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own photos"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'patient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'patient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);