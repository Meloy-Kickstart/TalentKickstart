'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const linkedinUrl = formData.get('linkedinUrl') as string
  const location = formData.get('location') as string

  const { error } = await (supabase
    .from('profiles') as any)
    .update({
      full_name: fullName,
      phone,
      linkedin_url: linkedinUrl,
      location,
    })
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

  const headline = formData.get('headline') as string
  const bio = formData.get('bio') as string
  const major = formData.get('major') as string
  const graduationYear = parseInt(formData.get('graduationYear') as string)
  const availability = formData.getAll('availability') as string[]
  const compensationPreference = formData.get('compensationPreference') as string
  const willingToRelocate = formData.get('willingToRelocate') === 'true'
  const requiresSponsorship = formData.get('requiresSponsorship') === 'true'
  const preferredCompanySizes = formData.getAll('preferredCompanySizes') as string[]
  const githubUrl = formData.get('githubUrl') as string
  const portfolioUrl = formData.get('portfolioUrl') as string
  const lookingFor = formData.get('lookingFor') as string
  const proudProject = formData.get('proudProject') as string
  const jobFunctions = formData.getAll('jobFunctions') as string[]
  const interestedRoles = formData.getAll('interestedRoles') as string[]

  const { error } = await supabase
    .from('students')
    .upsert({
      id: user.id,
      headline,
      bio,
      major,
      graduation_year: graduationYear,
      availability,
      compensation_preference: compensationPreference,
      willing_to_relocate: willingToRelocate,
      requires_sponsorship: requiresSponsorship,
      preferred_company_sizes: preferredCompanySizes,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      looking_for: lookingFor,
      proud_project: proudProject,
      job_functions: jobFunctions,
      interested_roles: interestedRoles,
    } as any)

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
    await supabase.from('experiences').insert(
      data.experiences.map(exp => ({
        student_id: user.id,
        company_name: exp.companyName,
        title: exp.title,
        description: exp.description,
        start_date: exp.startDate || null,
        end_date: exp.isCurrent ? null : (exp.endDate || null),
        is_current: exp.isCurrent,
      })) as any
    )
  }

  revalidatePath('/', 'layout')
  return { redirect: '/student/dashboard' }
}
