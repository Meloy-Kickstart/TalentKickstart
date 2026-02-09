import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith('/startup/') && pathname.split('/').length === 3
  )
  const isAuthRoute = pathname === '/login' || pathname === '/signup'
  const isOnboardingRoute = pathname === '/onboarding'

  // If no user and trying to access protected route, redirect to login
  if (!user && !isPublicRoute && !isOnboardingRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If no user and trying to access onboarding, redirect to login
  if (!user && isOnboardingRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user exists, handle redirects based on their profile status
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()

    // If no profile exists yet (race condition with trigger), allow access to onboarding
    // This handles the case where the user just signed up and the profile trigger hasn't completed
    if (!profile) {
      // If on auth pages, redirect to onboarding
      if (isAuthRoute) {
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
      // If on onboarding, allow access
      if (isOnboardingRoute) {
        return supabaseResponse
      }
      // For other protected routes, redirect to onboarding
      if (!isPublicRoute) {
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // User has a profile - check onboarding status
    const isOnboarded = profile.onboarding_completed

    // If user is NOT onboarded
    if (!isOnboarded) {
      // If on auth pages, redirect to onboarding
      if (isAuthRoute) {
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
      // If trying to access protected routes (dashboards, etc), redirect to onboarding
      if (!isPublicRoute && !isOnboardingRoute) {
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
      // Allow access to onboarding and public routes
      return supabaseResponse
    }

    // User IS onboarded
    // If on onboarding page, redirect to appropriate dashboard
    if (isOnboardingRoute) {
      if (profile.role === 'student') {
        url.pathname = '/student/dashboard'
      } else if (profile.role === 'startup') {
        url.pathname = '/startup/dashboard'
      } else if (profile.role === 'admin') {
        url.pathname = '/admin'
      } else {
        url.pathname = '/'
      }
      return NextResponse.redirect(url)
    }

    // If on auth pages (login/signup), redirect to appropriate dashboard
    if (isAuthRoute) {
      if (profile.role === 'student') {
        url.pathname = '/student/dashboard'
      } else if (profile.role === 'startup') {
        url.pathname = '/startup/dashboard'
      } else if (profile.role === 'admin') {
        url.pathname = '/admin'
      } else {
        url.pathname = '/'
      }
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
