-- ============================================
-- KICKSTART TALENT - DATABASE SCHEMA
-- Meloy Kickstart @ Texas A&M University
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (Core user info)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'startup', 'admin')),
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  location TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STUDENTS TABLE (Extended student profile)
-- ============================================
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Basic Info
  headline TEXT, -- e.g., "Machine learning engineer from Twitter"
  bio TEXT,
  
  -- Education
  major TEXT,
  graduation_year INTEGER,
  university TEXT DEFAULT 'Texas A&M University',
  
  -- Preferences
  availability TEXT[] DEFAULT '{}', -- ['full-time', 'part-time', 'internship', 'contract']
  compensation_preference TEXT, -- 'paid', 'equity', 'both', 'flexible'
  willing_to_relocate BOOLEAN DEFAULT FALSE,
  requires_sponsorship BOOLEAN DEFAULT FALSE,
  preferred_company_sizes TEXT[] DEFAULT '{}', -- ['1-10', '11-50', '51-200', '201-500', '500+']
  
  -- Links
  github_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  
  -- YC-style questions
  looking_for TEXT, -- What are you looking for in your next role?
  proud_project TEXT, -- Describe a project you're proud of
  
  -- Job Interests
  job_functions TEXT[] DEFAULT '{}', -- ['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'ml', 'data', 'design', 'pm']
  interested_roles TEXT[] DEFAULT '{}', -- Up to 4 specific role interests
  
  -- Status
  is_available BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EXPERIENCES TABLE (Work history)
-- ============================================
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE, -- NULL means current
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SKILLS TABLE (Master list)
-- ============================================
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT, -- 'language', 'framework', 'tool', 'soft'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STUDENT_SKILLS (Junction table)
-- ============================================
CREATE TABLE IF NOT EXISTS public.student_skills (
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, skill_id)
);

-- ============================================
-- STARTUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.startups (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT,
  tagline TEXT, -- Short one-liner
  website TEXT,
  logo_url TEXT,
  
  -- Company Details
  stage TEXT CHECK (stage IN ('idea', 'pre-seed', 'seed', 'series-a', 'series-b', 'growth')),
  industry TEXT,
  team_size TEXT, -- '1-10', '11-50', etc.
  founded_year INTEGER,
  location TEXT,
  
  -- Social
  twitter_url TEXT,
  linkedin_url TEXT,
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROLES TABLE (Job postings)
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  
  role_type TEXT CHECK (role_type IN ('full-time', 'part-time', 'internship', 'contract', 'cofounder')),
  job_function TEXT, -- 'frontend', 'backend', 'fullstack', etc.
  
  -- Compensation
  paid BOOLEAN DEFAULT FALSE,
  salary_min INTEGER,
  salary_max INTEGER,
  equity BOOLEAN DEFAULT FALSE,
  equity_range TEXT, -- '0.1-0.5%'
  
  -- Details
  duration TEXT, -- For internships/contracts
  location_type TEXT CHECK (location_type IN ('remote', 'onsite', 'hybrid')),
  location TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROLE_SKILLS (Required skills for role)
-- ============================================
CREATE TABLE IF NOT EXISTS public.role_skills (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (role_id, skill_id)
);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'viewed', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn')),
  
  cover_letter TEXT,
  notes TEXT, -- Startup internal notes
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate applications
  UNIQUE(role_id, student_id)
);

-- ============================================
-- SAVED_ROLES (Students bookmarking roles)
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_roles (
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (student_id, role_id)
);

-- ============================================
-- SAVED_STUDENTS (Startups bookmarking students)
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_students (
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (startup_id, student_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_students_available ON public.students(is_available);
CREATE INDEX IF NOT EXISTS idx_students_graduation ON public.students(graduation_year);
CREATE INDEX IF NOT EXISTS idx_startups_verified ON public.startups(is_verified);
CREATE INDEX IF NOT EXISTS idx_roles_startup ON public.roles(startup_id);
CREATE INDEX IF NOT EXISTS idx_roles_active ON public.roles(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_role ON public.applications(role_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_students ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GRANT PERMISSIONS FOR AUTHENTICATED AND SERVICE ROLE
-- ============================================
-- These grants ensure that authenticated users and service role can access tables

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Grant specific permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read-only for anon (public) users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Anyone can view profiles (basic info)
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Users can insert their own profile (for new signups)
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STUDENTS POLICIES
-- ============================================

-- Students are viewable by verified startups and admins (or themselves)
CREATE POLICY "Students viewable by authenticated users" 
  ON public.students FOR SELECT 
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
    OR
    (
      is_public = true 
      AND EXISTS (
        SELECT 1 FROM public.startups 
        WHERE startups.id = auth.uid() 
        AND startups.is_verified = true
      )
    )
  );

-- Students can insert their own record
CREATE POLICY "Students can insert own record" 
  ON public.students FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'student'
    )
  );

-- Students can update their own record
CREATE POLICY "Students can update own record" 
  ON public.students FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- EXPERIENCES POLICIES
-- ============================================

-- Experiences viewable if student profile is viewable
CREATE POLICY "Experiences viewable with student" 
  ON public.experiences FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.id = student_id
    )
  );

-- Students can manage their own experiences
CREATE POLICY "Students can insert experiences" 
  ON public.experiences FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update experiences" 
  ON public.experiences FOR UPDATE 
  USING (auth.uid() = student_id);

CREATE POLICY "Students can delete experiences" 
  ON public.experiences FOR DELETE 
  USING (auth.uid() = student_id);

-- ============================================
-- SKILLS POLICIES
-- ============================================

-- Skills are readable by everyone
CREATE POLICY "Skills are viewable by everyone" 
  ON public.skills FOR SELECT 
  USING (true);

-- Only admins can manage skills
CREATE POLICY "Admins can manage skills" 
  ON public.skills FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- STUDENT_SKILLS POLICIES
-- ============================================

-- Student skills viewable with student
CREATE POLICY "Student skills viewable" 
  ON public.student_skills FOR SELECT 
  USING (true);

-- Students can manage their own skills
CREATE POLICY "Students can manage own skills" 
  ON public.student_skills FOR ALL 
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- ============================================
-- STARTUPS POLICIES
-- ============================================

-- Verified startups are public
CREATE POLICY "Verified startups are public" 
  ON public.startups FOR SELECT 
  USING (
    is_verified = true 
    OR auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Startups can insert their own record
CREATE POLICY "Startups can insert own record" 
  ON public.startups FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'startup'
    )
  );

-- Startups can update their own record
CREATE POLICY "Startups can update own record" 
  ON public.startups FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any startup (for verification)
CREATE POLICY "Admins can update startups" 
  ON public.startups FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- ROLES POLICIES
-- ============================================

-- Active roles from verified startups are public
CREATE POLICY "Active roles are public" 
  ON public.roles FOR SELECT 
  USING (
    (
      is_active = true 
      AND EXISTS (
        SELECT 1 FROM public.startups 
        WHERE startups.id = startup_id 
        AND startups.is_verified = true
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.startups 
      WHERE startups.id = startup_id 
      AND startups.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Startups can create roles for themselves
CREATE POLICY "Startups can create roles" 
  ON public.roles FOR INSERT 
  WITH CHECK (
    auth.uid() = startup_id
    AND EXISTS (
      SELECT 1 FROM public.startups 
      WHERE startups.id = auth.uid()
    )
  );

-- Startups can update their own roles
CREATE POLICY "Startups can update own roles" 
  ON public.roles FOR UPDATE 
  USING (auth.uid() = startup_id)
  WITH CHECK (auth.uid() = startup_id);

-- Startups can delete their own roles
CREATE POLICY "Startups can delete own roles" 
  ON public.roles FOR DELETE 
  USING (auth.uid() = startup_id);

-- ============================================
-- ROLE_SKILLS POLICIES
-- ============================================

-- Role skills are viewable with roles
CREATE POLICY "Role skills viewable" 
  ON public.role_skills FOR SELECT 
  USING (true);

-- Startups can manage skills for their roles
CREATE POLICY "Startups can manage role skills" 
  ON public.role_skills FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.roles 
      WHERE roles.id = role_id 
      AND roles.startup_id = auth.uid()
    )
  );

-- ============================================
-- APPLICATIONS POLICIES
-- ============================================

-- Students can view their own applications
-- Startups can view applications for their roles
CREATE POLICY "View own applications" 
  ON public.applications FOR SELECT 
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.roles 
      WHERE roles.id = role_id 
      AND roles.startup_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Students can apply (insert)
CREATE POLICY "Students can apply" 
  ON public.applications FOR INSERT 
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.id = auth.uid()
    )
  );

-- Students can withdraw, startups can update status
CREATE POLICY "Update applications" 
  ON public.applications FOR UPDATE 
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.roles 
      WHERE roles.id = role_id 
      AND roles.startup_id = auth.uid()
    )
  );

-- ============================================
-- SAVED_ROLES POLICIES
-- ============================================

CREATE POLICY "Students manage saved roles" 
  ON public.saved_roles FOR ALL 
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- ============================================
-- SAVED_STUDENTS POLICIES
-- ============================================

CREATE POLICY "Startups manage saved students" 
  ON public.saved_students FOR ALL 
  USING (auth.uid() = startup_id)
  WITH CHECK (auth.uid() = startup_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_startups_updated_at
  BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SEED DATA: Skills
-- ============================================
INSERT INTO public.skills (name, category) VALUES
  -- Programming Languages
  ('JavaScript', 'language'),
  ('TypeScript', 'language'),
  ('Python', 'language'),
  ('Java', 'language'),
  ('C++', 'language'),
  ('C', 'language'),
  ('Go', 'language'),
  ('Rust', 'language'),
  ('Swift', 'language'),
  ('Kotlin', 'language'),
  ('Ruby', 'language'),
  ('PHP', 'language'),
  ('Scala', 'language'),
  ('R', 'language'),
  ('SQL', 'language'),
  
  -- Frontend
  ('React', 'framework'),
  ('Next.js', 'framework'),
  ('Vue.js', 'framework'),
  ('Angular', 'framework'),
  ('Svelte', 'framework'),
  ('HTML/CSS', 'framework'),
  ('Tailwind CSS', 'framework'),
  ('React Native', 'framework'),
  ('Flutter', 'framework'),
  
  -- Backend
  ('Node.js', 'framework'),
  ('Express.js', 'framework'),
  ('Django', 'framework'),
  ('Flask', 'framework'),
  ('FastAPI', 'framework'),
  ('Spring Boot', 'framework'),
  ('Ruby on Rails', 'framework'),
  ('Laravel', 'framework'),
  ('GraphQL', 'framework'),
  ('REST APIs', 'framework'),
  
  -- Databases & Tools
  ('PostgreSQL', 'tool'),
  ('MySQL', 'tool'),
  ('MongoDB', 'tool'),
  ('Redis', 'tool'),
  ('Elasticsearch', 'tool'),
  ('Firebase', 'tool'),
  ('Supabase', 'tool'),
  
  -- Cloud & DevOps
  ('AWS', 'tool'),
  ('Google Cloud', 'tool'),
  ('Azure', 'tool'),
  ('Docker', 'tool'),
  ('Kubernetes', 'tool'),
  ('CI/CD', 'tool'),
  ('Terraform', 'tool'),
  ('Linux', 'tool'),
  
  -- AI/ML
  ('Machine Learning', 'tool'),
  ('Deep Learning', 'tool'),
  ('TensorFlow', 'tool'),
  ('PyTorch', 'tool'),
  ('Computer Vision', 'tool'),
  ('NLP', 'tool'),
  ('LLMs', 'tool'),
  
  -- Design Tools
  ('Git', 'tool'),
  ('Figma', 'tool'),
  ('Adobe Creative Suite', 'tool'),
  ('Canva', 'tool'),
  ('Sketch', 'tool'),
  ('InVision', 'tool'),
  
  -- Business & Marketing Skills
  ('Digital Marketing', 'business'),
  ('SEO/SEM', 'business'),
  ('Social Media Marketing', 'business'),
  ('Content Marketing', 'business'),
  ('Email Marketing', 'business'),
  ('Google Analytics', 'business'),
  ('HubSpot', 'business'),
  ('Salesforce', 'business'),
  ('Market Research', 'business'),
  ('Financial Modeling', 'business'),
  ('Excel/Spreadsheets', 'business'),
  ('Data Analysis', 'business'),
  ('Business Development', 'business'),
  ('Account Management', 'business'),
  ('CRM Tools', 'business'),
  ('Tableau', 'business'),
  ('Power BI', 'business'),
  ('QuickBooks', 'business'),
  ('Project Management Tools', 'business'),
  
  -- Soft Skills
  ('Agile', 'soft'),
  ('System Design', 'soft'),
  ('Technical Writing', 'soft'),
  ('UI/UX Design', 'soft'),
  ('Product Management', 'soft'),
  ('Public Speaking', 'soft'),
  ('Leadership', 'soft'),
  ('Team Collaboration', 'soft'),
  ('Problem Solving', 'soft'),
  ('Communication', 'soft'),
  ('Negotiation', 'soft'),
  ('Strategic Planning', 'soft'),
  ('Event Planning', 'soft'),
  ('Customer Service', 'soft'),
  ('Copywriting', 'soft'),
  ('Video Editing', 'soft'),
  ('Photography', 'soft'),
  ('Research & Analysis', 'soft'),
  ('Presentation Skills', 'soft'),
  ('Time Management', 'soft')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STORAGE: Resumes Bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload resumes
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Allow anyone to read resumes (public bucket)
CREATE POLICY "Public read access for resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Allow users to update their own resumes
CREATE POLICY "Users can update own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes');

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');
