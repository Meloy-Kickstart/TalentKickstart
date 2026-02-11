import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { ApplicationStatusBadge } from '@/components/cards/application-status-badge'
import { RoleCard } from '@/components/cards/role-card'
import { EmptyState } from '@/components/cards/empty-state'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import {
  Briefcase,
  BookmarkCheck,
  Eye,
  TrendingUp,
  ArrowRight,
  User,
  FileText,
} from 'lucide-react'
import { AvailabilityToggle } from './availability-toggle'

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'student') redirect('/')

  // Fetch student data
  const { data: student } = await supabase
    .from('students')
    .select(`
      *,
      student_skills (
        skills (id, name)
      )
    `)
    .eq('id', user.id)
    .single()

  // Fetch applications with role and startup info
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      roles (
        id,
        title,
        role_type,
        location_type,
        created_at,
        startups (
          id,
          company_name,
          logo_url,
          tagline
        )
      )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recommended roles (verified startups with active roles)
  const { data: recommendedRoles } = await supabase
    .from('roles')
    .select(`
      *,
      startups!inner (
        id,
        company_name,
        logo_url,
        tagline,
        is_verified
      )
    `)
    .eq('is_active', true)
    .eq('startups.is_verified', true)
    .order('created_at', { ascending: false })
    .limit(3)

  // Calculate profile completion
  const profileFields = [
    (profile as any)?.full_name,
    (profile as any)?.phone,
    (profile as any)?.linkedin_url,
    (student as any)?.headline,
    (student as any)?.major,
    (student as any)?.graduation_year,
    (student as any)?.looking_for,
    (student as any)?.github_url,
  ]
  const skillsComplete = ((student as any)?.student_skills?.length || 0) >= 3
  const completedFields = profileFields.filter(Boolean).length + (skillsComplete ? 1 : 0)
  const totalFields = profileFields.length + 1
  const profileCompletion = Math.round((completedFields / totalFields) * 100)

  const userData = {
    id: user.id,
    email: user.email!,
    fullName: (profile as any)?.full_name,
    avatarUrl: (profile as any)?.avatar_url,
    role: (profile as any)?.role as 'student' | 'startup' | 'admin',
  }

  return (
    <DashboardLayout user={userData}>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back{(profile as any)?.full_name ? `, ${(profile as any).full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your job search
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AvailabilityToggle isAvailable={(student as any)?.is_available ?? true} />
            <Button asChild>
              <Link href="/roles">
                Browse Roles
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Profile Completion Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-2xl font-bold">{profileCompletion}%</div>
                  <Progress value={profileCompletion} className="mt-2" />
                </div>
                {profileCompletion < 100 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/student/profile">
                      <User className="h-4 w-4 mr-1" />
                      Complete
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Applications Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950/30">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{applications?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Total applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Views (placeholder) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profile Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-950/30">
                  <Eye className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-sm text-muted-foreground">This week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/applications">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {((applications as any[]) || []).map((app: any) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/roles/${(app as any).roles?.id}`}
                          className="font-medium hover:text-muted-foreground truncate block"
                        >
                          {(app as any).roles?.title}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          {(app as any).roles?.startups?.company_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime((app as any).created_at)}
                        </span>
                        <ApplicationStatusBadge status={(app as any).status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="No applications yet"
                  description="Start exploring roles and apply to ones that interest you"
                  action={
                    <Button asChild>
                      <Link href="/roles">Browse Roles</Link>
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Recommended Roles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recommended for You</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/roles">See more</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recommendedRoles && recommendedRoles.length > 0 ? (
                <div className="space-y-4">
                  {((recommendedRoles as any[]) || []).map((role: any) => (
                    <Link
                      key={(role as any).id}
                      href={`/roles/${(role as any).id}`}
                      className="block p-3 rounded-xl border border-edge hover:border-muted transition-colors"
                    >
                      <div className="font-medium">{(role as any).title}</div>
                      <p className="text-sm text-muted-foreground">
                        {(role as any).startups?.company_name}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {(role as any).role_type && (
                          <Badge variant="secondary" className="text-xs">
                            {(role as any).role_type}
                          </Badge>
                        )}
                        {(role as any).location_type && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {(role as any).location_type}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={TrendingUp}
                  title="No recommendations yet"
                  description="Complete your profile to get personalized role recommendations"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
