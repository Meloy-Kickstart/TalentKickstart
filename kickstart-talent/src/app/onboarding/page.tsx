import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentOnboarding } from './student-onboarding'
import { StartupOnboarding } from './startup-onboarding'
import { ensureProfileExists } from '@/lib/actions/auth'

export default async function OnboardingPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Ensure profile exists (creates if missing)
  const { profile, error } = await ensureProfileExists()

  if (error || !profile) {
    // If profile creation failed, redirect to login with error
    redirect('/login?error=profile_creation_failed')
  }

  if ((profile as any).onboarding_completed) {
    if ((profile as any).role === 'student') {
      redirect('/student/dashboard')
    } else if ((profile as any).role === 'startup') {
      redirect('/startup/dashboard')
    } else {
      redirect('/admin')
    }
  }

  // Fetch skills for student onboarding
  const { data: skills } = await supabase
    .from('skills')
    .select('id, name, category')
    .order('name')

  if ((profile as any).role === 'student') {
    return <StudentOnboarding skills={skills || []} />
  }

  if ((profile as any).role === 'startup') {
    return <StartupOnboarding />
  }

  redirect('/')
}
