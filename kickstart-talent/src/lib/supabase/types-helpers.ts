// Type helpers for Supabase responses until schema is created
// These will be replaced with proper generated types after running schema.sql

export type Profile = {
  id: string
  email?: string
  full_name?: string | null
  avatar_url?: string | null
  role?: 'student' | 'startup' | 'admin'
  onboarding_completed?: boolean
  phone?: string | null
  linkedin_url?: string | null
  location?: string | null
  created_at?: string
  updated_at?: string
}

export type Student = {
  id: string
  headline?: string | null
  bio?: string | null
  university?: string | null
  major?: string | null
  graduation_year?: number | null
  github_url?: string | null
  linkedin_url?: string | null
  portfolio_url?: string | null
  resume_url?: string | null
  is_available?: boolean | null
  looking_for?: string | null
  proud_project?: string | null
  preferred_company_size?: string[] | null
  preferred_role_types?: string[] | null
  student_skills?: any[]
  profiles?: Profile
}

export type Startup = {
  id: string
  company_name: string
  tagline?: string | null
  description?: string | null
  website?: string | null
  logo_url?: string | null
  stage?: string | null
  industry?: string | null
  team_size?: string | null
  founded_year?: number | null
  location?: string | null
  is_verified: boolean
  profiles?: Profile
  roles?: any[]
  created_at?: string
}

export type Role = {
  id: string
  startup_id: string
  title: string
  description?: string | null
  requirements?: string | null
  role_type?: string | null
  location?: string | null
  is_remote?: boolean | null
  salary_min?: number | null
  salary_max?: number | null
  equity_min?: number | null
  equity_max?: number | null
  is_active: boolean
  applications?: any[]
  startups?: Startup
  role_skills?: any[]
  created_at?: string
  location_type?: string | null
}

export type Application = {
  id: string
  role_id: string
  student_id: string
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected' | 'withdrawn'
  cover_letter?: string | null
  notes?: string | null
  roles?: Role
  students?: Student
  created_at?: string
}

export type Skill = {
  id: string
  name: string
  category?: string | null
}

export type Experience = {
  id: string
  student_id: string
  company: string
  title: string
  start_date: string
  end_date?: string | null
  is_current: boolean
  description?: string | null
}

// Helper to cast Supabase responses
export function asProfile(data: any): Profile | null {
  return data as Profile
}

export function asStudent(data: any): Student | null {
  return data as Student
}

export function asStartup(data: any): Startup | null {
  return data as Startup
}

export function asRole(data: any): Role | null {
  return data as Role
}

export function asApplication(data: any): Application | null {
  return data as Application
}

export function asSkill(data: any): Skill | null {
  return data as Skill
}

export function asExperience(data: any): Experience | null {
  return data as Experience
}
