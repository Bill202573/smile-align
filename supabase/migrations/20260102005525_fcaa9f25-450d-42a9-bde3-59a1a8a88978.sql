-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('patient', 'dentist', 'admin', 'refiner');

-- Criar enum para arcada
CREATE TYPE public.arch_type AS ENUM ('upper', 'lower', 'both');

-- Criar enum para tipo de foto
CREATE TYPE public.photo_type AS ENUM ('before', 'during', 'progress');

-- Criar enum para status de produção
CREATE TYPE public.production_status AS ENUM ('files_received', 'preparing_3d', 'printing', 'printed', 'ready_for_refining');

-- Criar enum para status de refinamento
CREATE TYPE public.refining_status AS ENUM ('received', 'refining', 'completed', 'returned');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles de usuários (separada por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Tabela de pacientes
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  upper_aligners INTEGER NOT NULL DEFAULT 0,
  lower_aligners INTEGER NOT NULL DEFAULT 0,
  current_upper_aligner INTEGER NOT NULL DEFAULT 1,
  current_lower_aligner INTEGER NOT NULL DEFAULT 1,
  days_per_aligner INTEGER NOT NULL DEFAULT 14,
  arch arch_type NOT NULL DEFAULT 'both',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  dentist_id UUID REFERENCES auth.users(id),
  dentist_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de trocas de alinhadores
CREATE TABLE public.aligner_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  aligner_number INTEGER NOT NULL,
  arch arch_type NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  photo_url TEXT,
  notes TEXT
);

-- Tabela de fotos
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type photo_type NOT NULL,
  aligner_number INTEGER NOT NULL DEFAULT 1,
  arch arch_type,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Tabela de produção
CREATE TABLE public.production_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  upper_aligner_count INTEGER NOT NULL DEFAULT 0,
  lower_aligner_count INTEGER NOT NULL DEFAULT 0,
  status production_status NOT NULL DEFAULT 'files_received',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  responsible TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de refinamento
CREATE TABLE public.refining_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  upper_aligner_count INTEGER NOT NULL DEFAULT 0,
  lower_aligner_count INTEGER NOT NULL DEFAULT 0,
  status refining_status NOT NULL DEFAULT 'received',
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  returned_at TIMESTAMP WITH TIME ZONE,
  value DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aligner_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refining_items ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter user_id do paciente (para RLS)
CREATE OR REPLACE FUNCTION public.get_patient_user_id(_patient_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id 
  FROM public.profiles p
  INNER JOIN public.patients pt ON pt.email = p.email
  WHERE pt.id = _patient_id
  LIMIT 1
$$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_items_updated_at
  BEFORE UPDATE ON public.production_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- RLS POLICIES
-- =====================

-- Profiles: usuários veem próprio perfil, admins veem todos
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- User Roles: apenas admins podem gerenciar
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Patients: admins e dentistas veem todos, pacientes veem próprio
CREATE POLICY "Admins can manage all patients"
  ON public.patients FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Dentists can view all patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'dentist'));

CREATE POLICY "Dentists can manage their patients"
  ON public.patients FOR ALL
  TO authenticated
  USING (dentist_id = auth.uid());

CREATE POLICY "Patients can view own data"
  ON public.patients FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM public.profiles WHERE user_id = auth.uid()));

-- Aligner Changes: baseado no acesso ao paciente
CREATE POLICY "Admins can manage all aligner changes"
  ON public.aligner_changes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Dentists can manage aligner changes"
  ON public.aligner_changes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE id = patient_id AND dentist_id = auth.uid()
    )
  );

CREATE POLICY "Patients can view own aligner changes"
  ON public.aligner_changes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      INNER JOIN public.profiles pr ON pr.email = p.email
      WHERE p.id = patient_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can insert own aligner changes"
  ON public.aligner_changes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      INNER JOIN public.profiles pr ON pr.email = p.email
      WHERE p.id = patient_id AND pr.user_id = auth.uid()
    )
  );

-- Photos: similar às aligner changes
CREATE POLICY "Admins can manage all photos"
  ON public.photos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Dentists can manage patient photos"
  ON public.photos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE id = patient_id AND dentist_id = auth.uid()
    )
  );

CREATE POLICY "Patients can manage own photos"
  ON public.photos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      INNER JOIN public.profiles pr ON pr.email = p.email
      WHERE p.id = patient_id AND pr.user_id = auth.uid()
    )
  );

-- Production Items: apenas admins e refiners
CREATE POLICY "Admins can manage production"
  ON public.production_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Refiners can view and update production"
  ON public.production_items FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'refiner'));

CREATE POLICY "Refiners can update production"
  ON public.production_items FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'refiner'));

-- Refining Items: apenas admins e refiners
CREATE POLICY "Admins can manage refining"
  ON public.refining_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Refiners can manage refining items"
  ON public.refining_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'refiner'));