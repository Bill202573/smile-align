-- Add status per arch to patients table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'arch_status') THEN
    CREATE TYPE public.arch_status AS ENUM ('em_uso', 'pausado', 'finalizado');
  END IF;
END $$;

-- Add arch status columns to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS upper_arch_status public.arch_status DEFAULT 'em_uso',
ADD COLUMN IF NOT EXISTS lower_arch_status public.arch_status DEFAULT 'em_uso',
ADD COLUMN IF NOT EXISTS upper_last_change_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS lower_last_change_date date DEFAULT CURRENT_DATE;

-- Update existing patients based on their current progress
UPDATE public.patients 
SET upper_arch_status = CASE 
  WHEN current_upper_aligner >= upper_aligners THEN 'finalizado'::arch_status
  ELSE 'em_uso'::arch_status
END,
lower_arch_status = CASE 
  WHEN current_lower_aligner >= lower_aligners THEN 'finalizado'::arch_status
  ELSE 'em_uso'::arch_status
END
WHERE true;