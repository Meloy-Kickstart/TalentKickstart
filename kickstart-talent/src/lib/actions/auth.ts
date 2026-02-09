'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function ensureProfileExists() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('ensureProfileExists: No user found')
    return { error: 'Not authenticated' }
  }

  console.log('ensureProfileExists: User found:', user.id)

  // Check if profile exists
  const { data: existingProfile, error: selectError } = await supabase
    .from('profiles')
    .select('id, role, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (existingProfile) {
    console.log('ensureProfileExists: Existing profile found:', existingProfile)
    return { profile: existingProfile }
  }

  console.log('ensureProfileExists: No profile found, creating one. Select error:', selectError?.message)

  // Profile doesn't exist, create it using admin client (bypasses RLS)
  const role = user.user_metadata?.role || 'student'
  const fullName = user.user_metadata?.full_name || ''

  console.log('ensureProfileExists: Creating profile with role:', role, 'fullName:', fullName)

  try {
    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
      return { error: 'Server configuration error - missing service role key' }
    }
    
    const adminSupabase = createAdminClient()
    
    // First, insert the profile
    const { error: insertError } = await (adminSupabase
      .from('profiles') as any)
      .upsert({
        id: user.id,
        email: user.email,
        role: role,
        full_name: fullName,
        onboarding_completed: false,
      }, {
        onConflict: 'id'
      })

    if (insertError) {
      console.error('Profile insert error:', JSON.stringify(insertError, null, 2))
      return { error: insertError.message || 'Failed to create profile' }
    }

    console.log('ensureProfileExists: Profile inserted successfully')

    // Then fetch the profile
    const { data: newProfile, error: fetchError } = await (adminSupabase
      .from('profiles') as any)
      .select('id, role, onboarding_completed')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Profile fetch error after insert:', JSON.stringify(fetchError, null, 2))
      return { error: fetchError.message || 'Failed to fetch profile' }
    }

    console.log('ensureProfileExists: Profile fetched successfully:', newProfile)
    return { profile: newProfile }
  } catch (e: any) {
    console.error('Admin client error:', e?.message || e)
    return { error: e?.message || 'Failed to create profile' }
  }
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as 'student' | 'startup'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is disabled, create profile immediately and redirect to onboarding
  if (data.user && data.session) {
    // Create profile using admin client (bypasses RLS)
    try {
      const adminSupabase = createAdminClient()
      
      await (adminSupabase
        .from('profiles') as any)
        .upsert({
          id: data.user.id,
          email: data.user.email,
          role: role,
          full_name: fullName,
          onboarding_completed: false,
        }, {
          onConflict: 'id'
        })
    } catch (e) {
      console.error('Profile creation error:', e)
    }
    
    return { redirect: '/onboarding' }
  }

  return { success: 'Check your email to confirm your account!' }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Get user profile to determine redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_completed')
    .eq('id', data.user.id)
    .single()

  revalidatePath('/', 'layout')

  if (profile && !(profile as any).onboarding_completed) {
    return { redirect: '/onboarding' }
  }

  if ((profile as any)?.role === 'student') {
    return { redirect: '/student/dashboard' }
  } else if ((profile as any)?.role === 'startup') {
    return { redirect: '/startup/dashboard' }
  } else if ((profile as any)?.role === 'admin') {
    return { redirect: '/admin' }
  }

  return { redirect: '/' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { redirect: '/' }
}
