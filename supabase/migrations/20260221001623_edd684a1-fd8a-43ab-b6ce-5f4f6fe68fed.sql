
-- Members table
CREATE TABLE public.members (
    member_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id TEXT UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('student', 'graduate', 'individual', 'organization')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    other_name TEXT,
    gender TEXT,
    date_of_birth DATE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    state TEXT,
    country TEXT DEFAULT 'Nigeria',
    registration_status TEXT NOT NULL DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student details
CREATE TABLE public.student_details (
    member_id BIGINT PRIMARY KEY REFERENCES public.members(member_id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    course_of_study TEXT NOT NULL,
    level TEXT,
    matric_number TEXT,
    expected_graduation_year INTEGER,
    student_id_card_file TEXT
);

-- Graduate details
CREATE TABLE public.graduate_details (
    member_id BIGINT PRIMARY KEY REFERENCES public.members(member_id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    qualification TEXT NOT NULL,
    graduation_year INTEGER NOT NULL,
    study_duration TEXT,
    ny_sc_status TEXT,
    certificate_file TEXT,
    cv_file TEXT
);

-- Professional details (for trained auditors / consultants)
CREATE TABLE public.professional_details (
    member_id BIGINT PRIMARY KEY REFERENCES public.members(member_id) ON DELETE CASCADE,
    profession TEXT NOT NULL,
    specialization TEXT,
    years_of_experience INTEGER,
    current_company TEXT,
    professional_certifications TEXT,
    license_number TEXT,
    cv_file TEXT
);

-- Organization details
CREATE TABLE public.organization_details (
    member_id BIGINT PRIMARY KEY REFERENCES public.members(member_id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    rc_number TEXT,
    organization_type TEXT,
    industry TEXT,
    iso_start_year TEXT,
    contact_person TEXT,
    contact_person_role TEXT,
    company_email TEXT NOT NULL,
    company_phone TEXT NOT NULL,
    company_address TEXT,
    number_of_staff INTEGER,
    company_certificate_file TEXT
);

-- Activity logs
CREATE TABLE public.activity_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(member_id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    description TEXT,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sent emails
CREATE TABLE public.sent_emails (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    member_id BIGINT REFERENCES public.members(member_id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (required for secure role management)
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Public ID generation function
CREATE OR REPLACE FUNCTION public.generate_public_id()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  next_num INTEGER;
  new_public_id TEXT;
BEGIN
  CASE NEW.category
    WHEN 'student' THEN prefix := 'STD';
    WHEN 'graduate' THEN prefix := 'GRD';
    WHEN 'individual' THEN prefix := 'IND';
    WHEN 'organization' THEN prefix := 'ORG';
    ELSE prefix := 'MEM';
  END CASE;

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(public_id FROM LENGTH(prefix) + 1) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM public.members
  WHERE category = NEW.category AND public_id IS NOT NULL;

  new_public_id := prefix || LPAD(next_num::TEXT, 5, '0');
  NEW.public_id := new_public_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_member_public_id
BEFORE INSERT ON public.members
FOR EACH ROW EXECUTE FUNCTION public.generate_public_id();

-- Enable RLS on all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduate_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated admin users can read/write all data
CREATE POLICY "Authenticated users can read members" ON public.members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update members" ON public.members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete members" ON public.members FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read student_details" ON public.student_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert student_details" ON public.student_details FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update student_details" ON public.student_details FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read graduate_details" ON public.graduate_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert graduate_details" ON public.graduate_details FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update graduate_details" ON public.graduate_details FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read professional_details" ON public.professional_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert professional_details" ON public.professional_details FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update professional_details" ON public.professional_details FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read organization_details" ON public.organization_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert organization_details" ON public.organization_details FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update organization_details" ON public.organization_details FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read activity_logs" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert activity_logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read sent_emails" ON public.sent_emails FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sent_emails" ON public.sent_emails FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Allow webhook/anon registration
CREATE POLICY "Anon can insert members" ON public.members FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert student_details" ON public.student_details FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert graduate_details" ON public.graduate_details FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert professional_details" ON public.professional_details FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert organization_details" ON public.organization_details FOR INSERT TO anon WITH CHECK (true);
