'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Only update fields that are actually present in the form
  const updateData: Record<string, unknown> = {}

  if (formData.has('fullName')) updateData.full_name = formData.get('fullName') as string
  if (formData.has('phone')) updateData.phone = formData.get('phone') as string
  if (formData.has('linkedinUrl')) updateData.linkedin_url = formData.get('linkedinUrl') as string
  if (formData.has('location')) updateData.location = formData.get('location') as string

  if (Object.keys(updateData).length === 0) {
    return { success: true }
  }

  const { error } = await (supabase
    .from('profiles') as any)
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/student/profile')
  return { success: true }
}

export async function updateStudentProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Only update fields that are actually present in the form
  // This prevents overwriting onboarding-only fields (availability, sponsorship, etc.)
  const updateData: Record<string, unknown> = { id: user.id }

  if (formData.has('headline')) updateData.headline = formData.get('headline') as string
  if (formData.has('bio')) updateData.bio = formData.get('bio') as string
  if (formData.has('university')) updateData.university = formData.get('university') as string
  if (formData.has('major')) updateData.major = formData.get('major') as string
  if (formData.has('graduationYear')) {
    const val = parseInt(formData.get('graduationYear') as string)
    if (!isNaN(val)) updateData.graduation_year = val
  }
  if (formData.has('githubUrl')) updateData.github_url = formData.get('githubUrl') as string
  if (formData.has('linkedinUrl')) updateData.linkedin_url = formData.get('linkedinUrl') as string
  if (formData.has('portfolioUrl')) updateData.portfolio_url = formData.get('portfolioUrl') as string
  if (formData.has('lookingFor')) updateData.looking_for = formData.get('lookingFor') as string
  if (formData.has('proudProject')) updateData.proud_project = formData.get('proudProject') as string
  if (formData.has('resumeUrl')) updateData.resume_url = formData.get('resumeUrl') as string

  // Only include these if they're actually in the form (e.g., onboarding or settings page)
  if (formData.has('availability')) updateData.availability = formData.getAll('availability') as string[]
  if (formData.has('compensationPreference')) updateData.compensation_preference = formData.get('compensationPreference') as string
  if (formData.has('willingToRelocate')) updateData.willing_to_relocate = formData.get('willingToRelocate') === 'true'
  if (formData.has('requiresSponsorship')) updateData.requires_sponsorship = formData.get('requiresSponsorship') === 'true'
  if (formData.has('preferredCompanySizes')) updateData.preferred_company_sizes = formData.getAll('preferredCompanySizes') as string[]
  if (formData.has('jobFunctions')) updateData.job_functions = formData.getAll('jobFunctions') as string[]
  if (formData.has('interestedRoles')) updateData.interested_roles = formData.getAll('interestedRoles') as string[]

  const { error } = await supabase
    .from('students')
    .upsert(updateData as any)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/student/profile')
  return { success: true }
}

export async function updateStudentSkills(skillIds: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Delete existing skills
  await supabase
    .from('student_skills')
    .delete()
    .eq('student_id', user.id)

  // Insert new skills
  if (skillIds.length > 0) {
    const { error } = await supabase
      .from('student_skills')
      .insert(skillIds.map(skillId => ({
        student_id: user.id,
        skill_id: skillId,
      })) as any)

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/student/profile')
  return { success: true }
}

export async function toggleAvailability() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: student } = await supabase
    .from('students')
    .select('is_available')
    .eq('id', user.id)
    .single()

  const { error } = await (supabase
    .from('students') as any)
    .update({ is_available: !(student as any)?.is_available })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function addExperience(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const companyName = formData.get('companyName') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const isCurrent = formData.get('isCurrent') === 'true'

  const { error } = await supabase
    .from('experiences')
    .insert({
      student_id: user.id,
      company_name: companyName,
      title,
      description,
      start_date: startDate || null,
      end_date: isCurrent ? null : (endDate || null),
      is_current: isCurrent,
    } as any)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/student/profile')
  return { success: true }
}

export async function deleteExperience(experienceId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('experiences')
    .delete()
    .eq('id', experienceId)
    .eq('student_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/student/profile')
  return { success: true }
}

export async function completeOnboarding(data: {
  profile: {
    fullName: string
    phone: string
    linkedinUrl: string
    location: string
  }
  student: {
    headline: string
    major: string
    graduationYear: number
    willingToRelocate: boolean
    requiresSponsorship: boolean
    preferredCompanySizes: string[]
    jobFunctions: string[]
    interestedRoles: string[]
    githubUrl: string
    lookingFor: string
    proudProject: string
    resumeUrl: string
  }
  skillIds: string[]
  experiences: {
    companyName: string
    title: string
    description: string
    startDate: string
    endDate: string
    isCurrent: boolean
  }[]
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update profile
  await (supabase
    .from('profiles') as any)
    .update({
      full_name: data.profile.fullName,
      phone: data.profile.phone,
      linkedin_url: data.profile.linkedinUrl,
      location: data.profile.location,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  // Insert/update student record
  await supabase
    .from('students')
    .upsert({
      id: user.id,
      headline: data.student.headline,
      major: data.student.major,
      graduation_year: data.student.graduationYear,
      willing_to_relocate: data.student.willingToRelocate,
      requires_sponsorship: data.student.requiresSponsorship,
      preferred_company_sizes: data.student.preferredCompanySizes,
      job_functions: data.student.jobFunctions,
      interested_roles: data.student.interestedRoles,
      github_url: data.student.githubUrl,
      looking_for: data.student.lookingFor,
      proud_project: data.student.proudProject,
      resume_url: data.student.resumeUrl,
    } as any)

  // Update skills
  await supabase.from('student_skills').delete().eq('student_id', user.id)
  if (data.skillIds.length > 0) {
    const adminSupabase = createAdminClient()

    // Process skills: some might be IDs, some might be "custom:name"
    const finalSkillIds: string[] = []

    for (const id of data.skillIds) {
      if (id.startsWith('custom:')) {
        const skillName = id.replace('custom:', '')

        // Try to find if it exists now (another student might have added it)
        const { data: existingSkill } = await (adminSupabase
          .from('skills') as any)
          .select('id')
          .eq('name', skillName)
          .single()

        if (existingSkill) {
          finalSkillIds.push(existingSkill.id)
        } else {
          // Insert new skill
          const { data: newSkill } = await (adminSupabase
            .from('skills') as any)
            .insert({ name: skillName, category: 'custom' })
            .select('id')
            .single()

          if (newSkill) {
            finalSkillIds.push(newSkill.id)
          }
        }
      } else {
        finalSkillIds.push(id)
      }
    }

    if (finalSkillIds.length > 0) {
      await supabase.from('student_skills').insert(
        finalSkillIds.map(skillId => ({
          student_id: user.id,
          skill_id: skillId,
        })) as any
      )
    }
  }

  // Insert experiences
  if (data.experiences.length > 0) {
    // Normalize date values - month inputs give "YYYY-MM" but DATE column needs "YYYY-MM-DD"
    const normalizeDate = (dateStr: string | null | undefined): string | null => {
      if (!dateStr) return null
      // If format is "YYYY-MM" (from month input), append "-01"
      if (/^\d{4}-\d{2}$/.test(dateStr)) return `${dateStr}-01`
      return dateStr
    }

    const { error: expError } = await supabase.from('experiences').insert(
      data.experiences.map(exp => ({
        student_id: user.id,
        company_name: exp.companyName,
        title: exp.title,
        description: exp.description || null,
        start_date: normalizeDate(exp.startDate),
        end_date: exp.isCurrent ? null : normalizeDate(exp.endDate),
        is_current: exp.isCurrent,
      })) as any
    )

    if (expError) {
      console.error('Error inserting experiences:', expError)
    }
  }

  revalidatePath('/', 'layout')
  return { redirect: '/student/dashboard' }
}
