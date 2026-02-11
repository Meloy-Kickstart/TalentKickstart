import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApplicationStatusBadge } from '@/components/cards/application-status-badge'
import { EmptyState } from '@/components/cards/empty-state'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import {
  Users,
  Briefcase,
  Eye,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

export default async function StartupDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'startup') redirect('/')

  // Fetch startup data
  const { data: startup } = await supabase
    .from('startups')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch roles with application counts
  const { data: roles } = await supabase
    .from('roles')
    .select(`
      *,
      applications (count)
    `)
    .eq('startup_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch recent applications
  const { data: recentApplications } = await supabase
    .from('applications')
    .select(`
      *,
      roles!inner (
        id,
        title,
        startup_id
      ),
      students (
        id,
        headline,
        profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('roles.startup_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate stats
  const totalRoles = (roles as any[])?.length || 0
  const activeRoles = ((roles as any[]) || []).filter((r: any) => r.is_active).length || 0
  const totalApplications = ((roles as any[]) || []).reduce((sum: number, role: any) => {
    const count = (role.applications as any)?.[0]?.count || 0
    return sum + count
  }, 0) || 0

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
              {(startup as any)?.company_name || 'Your Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              Manage your roles and review applications
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!(startup as any)?.is_verified && (
              <Badge variant="warning" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pending Verification
              </Badge>
            )}
            {(startup as any)?.is_verified && (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
            <Button asChild>
              <Link href="/startup/roles/new">
                <Plus className="h-4 w-4 mr-2" />
                Post New Role
              </Link>
            </Button>
          </div>
        </div>

        {/* Verification Banner */}
        {!(startup as any)?.is_verified && (
          <Card className="mb-6 border-amber-200 bg-amber-50/50 backdrop-blur-sm">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">
                    Your startup is pending verification
                  </p>
                  <p className="text-sm text-amber-800/80">
                    Once verified, your company and roles will be visible to students. This usually takes 1-2 business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950/30">
                  <Briefcase className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{activeRoles}</div>
                  <p className="text-sm text-muted-foreground">of {totalRoles} total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-950/30">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalApplications}</div>
                  <p className="text-sm text-muted-foreground">Across all roles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profile Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-950/30">
                  <Eye className="h-6 w-6 text-purple-400" />
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
          {/* Your Roles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Roles</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/startup/roles">Manage all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {roles && roles.length > 0 ? (
                <div className="space-y-4">
                  {((roles as any[]) || []).slice(0, 5).map((role: any) => {
                    const appCount = (role.applications as any)?.[0]?.count || 0
                    return (
                      <div
                        key={(role as any).id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/startup/roles/${(role as any).id}`}
                            className="font-medium hover:text-neutral-700 truncate block"
                          >
                            {(role as any).title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={(role as any).is_active ? 'success' : 'secondary'}
                              className="text-xs"
                            >
                              {(role as any).is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {(role as any).role_type && (
                              <span className="text-xs text-dim capitalize">
                                {(role as any).role_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm">
                            <span className="font-medium">{appCount}</span>
                            <span className="text-muted-foreground"> applicants</span>
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/startup/roles/${(role as any).id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="No roles posted yet"
                  description="Post your first role to start receiving applications from talented students"
                  action={
                    <Button asChild>
                      <Link href="/startup/roles/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Post a Role
                      </Link>
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/startup/applications">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentApplications && recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {((recentApplications as any[]) || []).map((app: any) => {
                    const student = (app as any).students as any
                    return (
                      <div
                        key={(app as any).id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/talent/${(student as any)?.id}`}
                            className="font-medium hover:text-neutral-700 truncate block"
                          >
                            {(student as any)?.profiles?.full_name || 'Unknown'}
                          </Link>
                          <p className="text-sm text-muted-foreground truncate">
                            Applied to {(app as any).roles?.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-dim">
                            {formatRelativeTime((app as any).created_at)}
                          </span>
                          <ApplicationStatusBadge status={(app as any).status} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No applications yet"
                  description="Applications will appear here once students apply to your roles"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
