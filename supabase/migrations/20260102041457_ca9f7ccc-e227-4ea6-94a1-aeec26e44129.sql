-- Re-enable RLS on patients and aligner_deliveries tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aligner_deliveries ENABLE ROW LEVEL SECURITY;