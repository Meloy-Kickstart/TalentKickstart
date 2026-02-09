'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStartupProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const companyName = formData.get('companyName') as string
  const tagline = formData.get('tagline') as string
  const description = formData.get('description') as string
  const website = formData.get('website') as string
  const stage = formData.get('stage') as string
  const industry = formData.get('industry') as string
  const teamSize = formData.get('teamSize') as string
  const foundedYear = parseInt(formData.get('foundedYear') as string) || null
  const location = formData.get('location') as string
  const twitterUrl = formData.get('twitterUrl') as string
  const linkedinUrl = formData.get('linkedinUrl') as string

  const { error } = await supabase
    .from('startups')
    .upsert({
      id: user.id,
      company_name: companyName,
      tagline,
      description,
      website,
      stage,
      industry,
      team_size: teamSize,
      founded_year: foundedYear,
      location,
      twitter_url: twitterUrl,
      linkedin_url: linkedinUrl,
    } as any)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/startup/profile')
  return { success: true }
}

export async function createRole(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const requirements = formData.get('requirements') as string
  const roleType = formData.get('role_type') as string
  const jobFunction = formData.get('jobFunction') as string
  const paid = formData.get('paid') === 'true'
  const salaryMin = parseInt(formData.get('salary_min') as string) || null
  const salaryMax = parseInt(formData.get('salary_max') as string) || null
  const equityMin = parseFloat(formData.get('equity_min') as string) || null
  const equityMax = parseFloat(formData.get('equity_max') as string) || null
  const duration = formData.get('duration') as string
  const isRemote = formData.get('is_remote') === 'true'
  const location = formData.get('location') as string
  const skillIdsJson = formData.get('skill_ids') as string
  const customSkillsJson = formData.get('custom_skills') as string
  const skillIds = skillIdsJson ? JSON.parse(skillIdsJson) : []
  const customSkills = customSkillsJson ? JSON.parse(customSkillsJson) : []

  const { data, error } = await supabase
    .from('roles')
    .insert({
      startup_id: user.id,
      title,
      description,
      requirements,
      role_type: roleType,
      job_function: jobFunction,
      paid,
      salary_min: salaryMin,
      salary_max: salaryMax,
      equity_min: equityMin,
      equity_max: equityMax,
      duration,
      is_remote: isRemote,
      location,
    } as any)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  const roleId = (data as any).id

  // Handle custom skills - create them if they don't exist
  for (const skillName of customSkills) {
    const { data: existingSkill } = await supabase
      .from('skills')
      .select('id')
      .ilike('name', skillName)
      .single()

    if (existingSkill) {
      skillIds.push((existingSkill as any).id)
    } else {
      const { data: newSkill } = await supabase
        .from('skills')
        .insert({ name: skillName, category: 'custom' } as any)
        .select('id')
        .single()
      if (newSkill) {
        skillIds.push((newSkill as any).id)
      }
    }
  }

  // Insert role skills
  if (skillIds.length > 0) {
    await supabase
      .from('role_skills')
      .insert(skillIds.map((skillId: string) => ({
        role_id: roleId,
        skill_id: skillId,
      })))
  }

  revalidatePath('/startup/roles')
  return { success: true, roleId }
}

export async function updateRole(roleId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const requirements = formData.get('requirements') as string
  const roleType = formData.get('role_type') as string
  const jobFunction = formData.get('jobFunction') as string
  const paid = formData.get('paid') === 'true'
  const salaryMin = parseInt(formData.get('salary_min') as string) || null
  const salaryMax = parseInt(formData.get('salary_max') as string) || null
  const equityMin = parseFloat(formData.get('equity_min') as string) || null
  const equityMax = parseFloat(formData.get('equity_max') as string) || null
  const duration = formData.get('duration') as string
  const isRemote = formData.get('is_remote') === 'true'
  const isActive = formData.get('is_active') === 'true'
  const location = formData.get('location') as string
  const skillIdsJson = formData.get('skill_ids') as string
  const customSkillsJson = formData.get('custom_skills') as string
  const skillIds = skillIdsJson ? JSON.parse(skillIdsJson) : []
  const customSkills = customSkillsJson ? JSON.parse(customSkillsJson) : []

  const { error } = await (supabase
    .from('roles') as any)
    .update({
      title,
      description,
      requirements,
      role_type: roleType,
      job_function: jobFunction,
      paid,
      salary_min: salaryMin,
      salary_max: salaryMax,
      equity_min: equityMin,
      equity_max: equityMax,
      duration,
      is_remote: isRemote,
      location,
      is_active: isActive,
    })
    .eq('id', roleId)
    .eq('startup_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Handle custom skills - create them if they don't exist
  for (const skillName of customSkills) {
    const { data: existingSkill } = await supabase
      .from('skills')
      .select('id')
      .ilike('name', skillName)
      .single()

    if (existingSkill) {
      skillIds.push((existingSkill as any).id)
    } else {
      const { data: newSkill } = await supabase
        .from('skills')
        .insert({ name: skillName, category: 'custom' } as any)
        .select('id')
        .single()
      if (newSkill) {
        skillIds.push((newSkill as any).id)
      }
    }
  }

  // Delete existing role skills and re-insert
  await supabase
    .from('role_skills')
    .delete()
    .eq('role_id', roleId)

  // Insert new role skills
  if (skillIds.length > 0) {
    await supabase
      .from('role_skills')
      .insert(skillIds.map((skillId: string) => ({
        role_id: roleId,
        skill_id: skillId,
      })))
  }

  revalidatePath('/startup/roles')
  return { success: true }
}

export async function deleteRole(roleId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId)
    .eq('startup_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/startup/roles')
  return { success: true }
}

export async function toggleRoleStatus(roleId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: role } = await supabase
    .from('roles')
    .select('is_active')
    .eq('id', roleId)
    .eq('startup_id', user.id)
    .single()

  const { error } = await (supabase
    .from('roles') as any)
    .update({ is_active: !(role as any)?.is_active })
    .eq('id', roleId)
    .eq('startup_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/startup/roles')
  return { success: true }
}

export async function completeStartupOnboarding(data: {
  profile: {
    fullName: string
    phone: string
    linkedinUrl: string
  }
  startup: {
    companyName: string
    tagline: string
    description: string
    website: string
    stage: string
    industry: string
    teamSize: string
    location: string
  }
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
      onboarding_completed: true,
    })
    .eq('id', user.id)

  // Insert startup record
  await supabase
    .from('startups')
    .upsert({
      id: user.id,
      company_name: data.startup.companyName,
      tagline: data.startup.tagline,
      description: data.startup.description,
      website: data.startup.website,
      stage: data.startup.stage,
      industry: data.startup.industry,
      team_size: data.startup.teamSize,
      location: data.startup.location,
    } as any)

  revalidatePath('/', 'layout')
  return { redirect: '/startup/dashboard' }
}
