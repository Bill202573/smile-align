-- Add process_number to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS process_number TEXT;

-- Add retainer delivery fields to aligner_deliveries
ALTER TABLE public.aligner_deliveries 
ADD COLUMN IF NOT EXISTS upper_retainer_qty INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lower_retainer_qty INTEGER DEFAULT 0;

-- Temporarily disable RLS on aligner_deliveries to allow testing
ALTER TABLE public.aligner_deliveries DISABLE ROW LEVEL SECURITY;