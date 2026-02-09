export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'student' | 'startup' | 'admin'
          full_name: string | null
          email: string
          phone: string | null
          linkedin_url: string | null
          location: string | null
          avatar_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'student' | 'startup' | 'admin'
          full_name?: string | null
          email: string
          phone?: string | null
          linkedin_url?: string | null
          location?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'student' | 'startup' | 'admin'
          full_name?: string | null
          email?: string
          phone?: string | null
          linkedin_url?: string | null
          location?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          headline: string | null
          bio: string | null
          major: string | null
          graduation_year: number | null
          university: string
          availability: string[]
          compensation_preference: string | null
          willing_to_relocate: boolean
          requires_sponsorship: boolean
          preferred_company_sizes: string[]
          github_url: string | null
          portfolio_url: string | null
          resume_url: string | null
          looking_for: string | null
          proud_project: string | null
          job_functions: string[]
          interested_roles: string[]
          is_available: boolean
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          headline?: string | null
          bio?: string | null
          major?: string | null
          graduation_year?: number | null
          university?: string
          availability?: string[]
          compensation_preference?: string | null
          willing_to_relocate?: boolean
          requires_sponsorship?: boolean
          preferred_company_sizes?: string[]
          github_url?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          looking_for?: string | null
          proud_project?: string | null
          job_functions?: string[]
          interested_roles?: string[]
          is_available?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          headline?: string | null
          bio?: string | null
          major?: string | null
          graduation_year?: number | null
          university?: string
          availability?: string[]
          compensation_preference?: string | null
          willing_to_relocate?: boolean
          requires_sponsorship?: boolean
          preferred_company_sizes?: string[]
          github_url?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          looking_for?: string | null
          proud_project?: string | null
          job_functions?: string[]
          interested_roles?: string[]
          is_available?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      experiences: {
        Row: {
          id: string
          student_id: string
          company_name: string
          title: string
          description: string | null
          start_date: string | null
          end_date: string | null
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          company_name: string
          title: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          company_name?: string
          title?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          created_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          created_at?: string
        }
      }
      student_skills: {
        Row: {
          student_id: string
          skill_id: string
        }
        Insert: {
          student_id: string
          skill_id: string
        }
        Update: {
          student_id?: string
          skill_id?: string
        }
      }
      startups: {
        Row: {
          id: string
          company_name: string
          description: string | null
          tagline: string | null
          website: string | null
          logo_url: string | null
          stage: string | null
          industry: string | null
          team_size: string | null
          founded_year: number | null
          location: string | null
          twitter_url: string | null
          linkedin_url: string | null
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name: string
          description?: string | null
          tagline?: string | null
          website?: string | null
          logo_url?: string | null
          stage?: string | null
          industry?: string | null
          team_size?: string | null
          founded_year?: number | null
          location?: string | null
          twitter_url?: string | null
          linkedin_url?: string | null
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          description?: string | null
          tagline?: string | null
          website?: string | null
          logo_url?: string | null
          stage?: string | null
          industry?: string | null
          team_size?: string | null
          founded_year?: number | null
          location?: string | null
          twitter_url?: string | null
          linkedin_url?: string | null
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          startup_id: string
          title: string
          description: string | null
          requirements: string | null
          role_type: string | null
          job_function: string | null
          paid: boolean
          salary_min: number | null
          salary_max: number | null
          equity: boolean
          equity_range: string | null
          duration: string | null
          location_type: string | null
          location: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          title: string
          description?: string | null
          requirements?: string | null
          role_type?: string | null
          job_function?: string | null
          paid?: boolean
          salary_min?: number | null
          salary_max?: number | null
          equity?: boolean
          equity_range?: string | null
          duration?: string | null
          location_type?: string | null
          location?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          title?: string
          description?: string | null
          requirements?: string | null
          role_type?: string | null
          job_function?: string | null
          paid?: boolean
          salary_min?: number | null
          salary_max?: number | null
          equity?: boolean
          equity_range?: string | null
          duration?: string | null
          location_type?: string | null
          location?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      role_skills: {
        Row: {
          role_id: string
          skill_id: string
          is_required: boolean
        }
        Insert: {
          role_id: string
          skill_id: string
          is_required?: boolean
        }
        Update: {
          role_id?: string
          skill_id?: string
          is_required?: boolean
        }
      }
      applications: {
        Row: {
          id: string
          role_id: string
          student_id: string
          status: 'applied' | 'viewed' | 'interview' | 'offer' | 'accepted' | 'rejected' | 'withdrawn'
          cover_letter: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_id: string
          student_id: string
          status?: 'applied' | 'viewed' | 'interview' | 'offer' | 'accepted' | 'rejected' | 'withdrawn'
          cover_letter?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          student_id?: string
          status?: 'applied' | 'viewed' | 'interview' | 'offer' | 'accepted' | 'rejected' | 'withdrawn'
          cover_letter?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_roles: {
        Row: {
          student_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          student_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          student_id?: string
          role_id?: string
          created_at?: string
        }
      }
      saved_students: {
        Row: {
          startup_id: string
          student_id: string
          created_at: string
        }
        Insert: {
          startup_id: string
          student_id: string
          created_at?: string
        }
        Update: {
          startup_id?: string
          student_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Experience = Database['public']['Tables']['experiences']['Row']
export type Skill = Database['public']['Tables']['skills']['Row']
export type Startup = Database['public']['Tables']['startups']['Row']
export type Role = Database['public']['Tables']['roles']['Row']
export type Application = Database['public']['Tables']['applications']['Row']

export type ProfileWithRole = Profile & {
  students?: Student
  startups?: Startup
}

export type StudentWithProfile = Student & {
  profiles: Profile
  student_skills?: { skills: Skill }[]
  experiences?: Experience[]
}

export type StartupWithProfile = Startup & {
  profiles: Profile
  roles?: Role[]
}

export type RoleWithStartup = Role & {
  startups: Startup
  role_skills?: { skills: Skill }[]
}

export type ApplicationWithDetails = Application & {
  roles: RoleWithStartup
  students: StudentWithProfile
}
