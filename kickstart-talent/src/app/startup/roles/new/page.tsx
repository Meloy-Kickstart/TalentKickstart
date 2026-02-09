import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleForm } from '../role-form'

export default async function NewRolePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'startup') redirect('/')

  // Fetch startup info
  const { data: startup } = await supabase
    .from('startups')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!startup) redirect('/onboarding')

  // Fetch all skills
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

  return (
    <DashboardLayout user={userData}>
      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Post a New Role</h1>
          <p className="text-neutral-500">
            Create a new role to start receiving applications from students
          </p>
        </div>

        <RoleForm
          allSkills={allSkills || []}
          startup={startup}
        />
      </div>
    </DashboardLayout>
  )
}
