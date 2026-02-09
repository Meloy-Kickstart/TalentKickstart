import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Ensure profile exists after email confirmation
      const user = data.user
      const role = user.user_metadata?.role || 'student'
      const fullName = user.user_metadata?.full_name || ''
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      // Create profile if it doesn't exist using admin client (bypasses RLS)
      if (!existingProfile) {
        try {
          const adminSupabase = createAdminClient()
          
          await (adminSupabase
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
        } catch (e) {
          console.error('Profile creation error in callback:', e)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to login page on error
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
