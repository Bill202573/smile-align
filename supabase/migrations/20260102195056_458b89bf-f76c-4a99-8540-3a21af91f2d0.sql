-- Add 'refino' to treatment_status enum
ALTER TYPE public.treatment_status ADD VALUE IF NOT EXISTS 'refino';

-- Add refinement fields to patients table
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS refining_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS refining_upper_aligners integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS refining_lower_aligners integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_refining_upper integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_refining_lower integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS refining_upper_status public.arch_status DEFAULT 'em_uso',
ADD COLUMN IF NOT EXISTS refining_lower_status public.arch_status DEFAULT 'em_uso',
ADD COLUMN IF NOT EXISTS refining_upper_last_change date,
ADD COLUMN IF NOT EXISTS refining_lower_last_change date;

-- Create treatment_history table for unified history
CREATE TABLE IF NOT EXISTS public.treatment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  event_date timestamp with time zone NOT NULL DEFAULT now(),
  arch public.arch_type NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('aligner_change', 'pause_started', 'pause_released', 'arch_completed', 'refining_started', 'refining_completed')),
  aligner_from integer,
  aligner_to integer,
  is_refining boolean DEFAULT false,
  patient_reason text,
  dentist_note text,
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.treatment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for treatment_history
CREATE POLICY "Admins can manage all treatment history"
ON public.treatment_history
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Dentists can manage treatment history for their patients"
ON public.treatment_history
FOR ALL
USING (EXISTS (
  SELECT 1 FROM patients
  WHERE patients.id = treatment_history.patient_id
  AND patients.dentist_id = auth.uid()
));

CREATE POLICY "Patients can view own treatment history"
ON public.treatment_history
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM patients p
  JOIN profiles pr ON pr.email = p.email
  WHERE p.id = treatment_history.patient_id
  AND pr.user_id = auth.uid()
));

CREATE POLICY "Patients can insert own treatment history"
ON public.treatment_history
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM patients p
  JOIN profiles pr ON pr.email = p.email
  WHERE p.id = treatment_history.patient_id
  AND pr.user_id = auth.uid()
));