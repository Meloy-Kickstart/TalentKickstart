import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleForm } from '../../role-form'

interface EditRolePageProps {
  params: Promise<{ id: string }>
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params
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

  // Fetch the role
  const { data: role } = await supabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .eq('startup_id', user.id)
    .single()

  if (!role) notFound()

  // Fetch current skills for this role
  const { data: roleSkills } = await supabase
    .from('role_skills')
    .select('skill_id')
    .eq('role_id', id)

  const currentSkillIds = (roleSkills || []).map((rs: any) => rs.skill_id)

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
          <h1 className="text-2xl font-bold">Edit Role</h1>
          <p className="text-neutral-500">
            Update the details of your role posting
          </p>
        </div>

        <RoleForm
          allSkills={allSkills || []}
          startup={startup}
          role={role as any}
          currentSkillIds={currentSkillIds}
        />
      </div>
    </DashboardLayout>
  )
}
