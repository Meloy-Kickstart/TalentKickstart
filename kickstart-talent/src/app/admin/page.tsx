import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') redirect('/')

  // Fetch stats
  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })

  const { count: activeStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true)

  const { count: totalStartups } = await supabase
    .from('startups')
    .select('*', { count: 'exact', head: true })

  const { count: verifiedStartups } = await supabase
    .from('startups')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)

  const { count: pendingStartups } = await supabase
    .from('startups')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', false)

  const { count: totalRoles } = await supabase
    .from('roles')
    .select('*', { count: 'exact', head: true })

  const { count: activeRoles } = await supabase
    .from('roles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: totalApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })

  // Fetch pending startups for review
  const { data: pendingStartupsList } = await supabase
    .from('startups')
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .eq('is_verified', false)
    .order('created_at', { ascending: true })
    .limit(5)

  // Fetch recent applications
  const { data: recentApplications } = await supabase
    .from('applications')
    .select(`
      *,
      roles (
        title,
        startups (
          company_name
        )
      ),
      students (
        profiles (
          full_name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of platform activity and pending actions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950/30">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalStudents || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeStudents || 0} available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Startups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-950/30">
                  <Building2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalStartups || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingStartups || 0} pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-950/30">
                  <Briefcase className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{activeRoles || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    of {totalRoles || 0} total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-950/30">
                  <FileText className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalApplications || 0}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Verifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Pending Verifications
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/startups">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingStartupsList && pendingStartupsList.length > 0 ? (
                <div className="space-y-4">
                  {((pendingStartupsList as any[]) || []).map((startup: any) => {
                    const contact = (startup as any).profiles as any
                    return (
                      <div
                        key={(startup as any).id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{(startup as any).company_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(contact as any)?.full_name || 'Unknown'} • {(contact as any)?.email}
                          </p>
                          <p className="text-xs text-dim">
                            Applied {formatRelativeTime((startup as any).created_at)}
                          </p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/admin/startups/${(startup as any).id}`}>
                            Review
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">All caught up!</p>
                  <p className="text-sm text-dim">
                    No pending verifications
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Recent Applications
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/applications">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentApplications && recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {((recentApplications as any[]) || []).map((app: any) => {
                    const student = (app as any).students as any
                    const role = (app as any).roles as any
                    return (
                      <div
                        key={(app as any).id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {(student as any)?.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            Applied to {(role as any)?.title} at {(role as any)?.startups?.company_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={
                            (app as any).status === 'pending' ? 'warning' :
                            (app as any).status === 'accepted' ? 'success' :
                            (app as any).status === 'rejected' ? 'destructive' :
                            'secondary'
                          }>
                            {(app as any).status}
                          </Badge>
                          <span className="text-xs text-dim">
                            {formatRelativeTime((app as any).created_at)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-dim text-center py-8">
                  No applications yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
