-- Add gender enum type
CREATE TYPE public.gender_type AS ENUM ('male', 'female');

-- Add treatment status enum type  
CREATE TYPE public.treatment_status AS ENUM ('in_treatment', 'completed');

-- Add new columns to patients table
ALTER TABLE public.patients 
ADD COLUMN gender public.gender_type,
ADD COLUMN treatment_status public.treatment_status NOT NULL DEFAULT 'in_treatment',
ADD COLUMN estimated_completion_date date;