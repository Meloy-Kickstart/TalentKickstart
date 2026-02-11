'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyStartup(startupId: string, verified: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await (supabase
    .from('startups') as any)
    .update({ is_verified: verified })
    .eq('id', startupId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/startups')
  return { success: true }
}

export async function declineStartup(startupId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(startupId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/startups')
  return { success: true }
}

export async function getAdminMetrics() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const [
    { count: totalStudents },
    { count: totalStartups },
    { count: verifiedStartups },
    { count: totalRoles },
    { count: totalApplications },
    { count: acceptedApplications },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('startups').select('*', { count: 'exact', head: true }),
    supabase.from('startups').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('roles').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
  ])

  return {
    totalStudents: totalStudents || 0,
    totalStartups: totalStartups || 0,
    verifiedStartups: verifiedStartups || 0,
    totalRoles: totalRoles || 0,
    totalApplications: totalApplications || 0,
    placements: acceptedApplications || 0,
  }
}
