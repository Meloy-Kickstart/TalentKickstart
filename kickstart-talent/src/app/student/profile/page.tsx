import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProfileEditor } from './profile-editor'

export default async function StudentProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'student') redirect('/')

  // Fetch student data
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch student skills with skill details
  const { data: studentSkills } = await supabase
    .from('student_skills')
    .select(`
      skill_id,
      skills (
        id,
        name,
        category
      )
    `)
    .eq('student_id', user.id)

  // Fetch experiences
  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .eq('student_id', user.id)
    .order('is_current', { ascending: false })
    .order('end_date', { ascending: false, nullsFirst: true })

  // Fetch all available skills
  const { data: allSkills } = await supabase
    .from('skills')
    .select('*')
    .order('category')
    .order('name')

  const userData = {
    id: user.id,
    email: user.email!,
    fullName: (profile as any)?.full_name,
    avatarUrl: (profile as any)?.avatar_url,
    role: (profile as any)?.role as 'student' | 'startup' | 'admin',
  }

  const currentSkillIds = studentSkills?.map(ss => (ss as any).skill_id) || []

  return (
    <DashboardLayout user={userData}>
      <ProfileEditor
        profile={profile}
        student={student}
        experiences={experiences || []}
        allSkills={allSkills || []}
        currentSkillIds={currentSkillIds}
      />
    </DashboardLayout>
  )
}
