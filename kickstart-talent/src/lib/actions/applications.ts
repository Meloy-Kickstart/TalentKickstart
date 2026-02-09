'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyToRole(roleId: string, coverLetter?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if already applied
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('role_id', roleId)
    .eq('student_id', user.id)
    .single()

  if (existingApplication) {
    return { error: 'You have already applied to this role' }
  }

  const { error } = await supabase
    .from('applications')
    .insert({
      role_id: roleId,
      student_id: user.id,
      cover_letter: coverLetter,
    } as any)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/student/dashboard')
  revalidatePath('/roles')
  return { success: true }
}

export async function withdrawApplication(applicationId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await (supabase
    .from('applications') as any)
    .update({ status: 'withdrawn' })
    .eq('id', applicationId)
    .eq('student_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function updateApplicationStatus(
  applicationId: string, 
  status: 'viewed' | 'interview' | 'offer' | 'accepted' | 'rejected',
  notes?: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify the startup owns this application
  const { data: application } = await supabase
    .from('applications')
    .select(`
      id,
      roles!inner (
        startup_id
      )
    `)
    .eq('id', applicationId)
    .single()

  if (!application || ((application as any).roles as { startup_id: string }).startup_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const updateData: { status: string; notes?: string } = { status }
  if (notes !== undefined) {
    updateData.notes = notes
  }

  const { error } = await (supabase
    .from('applications') as any)
    .update(updateData)
    .eq('id', applicationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/startup/roles')
  return { success: true }
}

export async function saveRole(roleId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('saved_roles')
    .insert({
      student_id: user.id,
      role_id: roleId,
    } as any)

  if (error) {
    if (error.code === '23505') {
      return { error: 'Role already saved' }
    }
    return { error: error.message }
  }

  revalidatePath('/roles')
  return { success: true }
}

export async function unsaveRole(roleId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('saved_roles')
    .delete()
    .eq('student_id', user.id)
    .eq('role_id', roleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/roles')
  return { success: true }
}

export async function saveStudent(studentId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('saved_students')
    .insert({
      startup_id: user.id,
      student_id: studentId,
    } as any)

  if (error) {
    if (error.code === '23505') {
      return { error: 'Student already saved' }
    }
    return { error: error.message }
  }

  revalidatePath('/talent')
  return { success: true }
}

export async function unsaveStudent(studentId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('saved_students')
    .delete()
    .eq('startup_id', user.id)
    .eq('student_id', studentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/talent')
  return { success: true }
}
