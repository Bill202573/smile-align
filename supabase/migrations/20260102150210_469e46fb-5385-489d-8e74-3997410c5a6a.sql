-- Desabilitar RLS temporariamente em todas as tabelas para testes

ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aligner_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aligner_deliveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.refining_items DISABLE ROW LEVEL SECURITY;