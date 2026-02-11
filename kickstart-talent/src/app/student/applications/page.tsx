import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ApplicationStatusBadge } from '@/components/cards/application-status-badge'
import { EmptyState } from '@/components/cards/empty-state'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import {
  FileText,
  ArrowRight,
  Building2,
  Briefcase,
} from 'lucide-react'

export default async function StudentApplicationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'student') redirect('/')

  // Fetch applications with role and startup info
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      roles (
        id,
        title,
        role_type,
        location,
        is_remote,
        startups (
          id,
          company_name,
          logo_url
        )
      )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  const profileData = profile as any
  const applicationsData = (applications || []) as any[]

  const userData = {
    id: user.id,
    email: user.email!,
    fullName: profileData?.full_name,
    avatarUrl: profileData?.avatar_url,
    role: profileData?.role as 'student' | 'startup' | 'admin',
  }

  // Group by status
  const pendingApps = applicationsData.filter((a: any) => a.status === 'pending')
  const reviewingApps = applicationsData.filter((a: any) => a.status === 'reviewing')
  const interviewApps = applicationsData.filter((a: any) => a.status === 'interview')
  const acceptedApps = applicationsData.filter((a: any) => a.status === 'accepted')
  const rejectedApps = applicationsData.filter((a: any) => a.status === 'rejected')
  const withdrawnApps = applicationsData.filter((a: any) => a.status === 'withdrawn')

  const activeApps = [...pendingApps, ...reviewingApps, ...interviewApps]
  const closedApps = [...acceptedApps, ...rejectedApps, ...withdrawnApps]

  return (
    <DashboardLayout user={userData}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Your Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your job applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold">{applicationsData.length}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{pendingApps.length}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{interviewApps.length}</div>
              <p className="text-sm text-muted-foreground">Interview</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-green-400">{acceptedApps.length}</div>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </CardContent>
          </Card>
        </div>

        {applicationsData.length > 0 ? (
          <div className="space-y-8">
            {/* Active Applications */}
            {activeApps.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Active Applications</h2>
                <div className="space-y-3">
                  {activeApps.map((app: any) => {
                    const appData = app as any
                    const role = appData.roles as {
                      id: string
                      title: string
                      role_type?: string
                      location?: string
                      is_remote?: boolean
                      startups?: {
                        id: string
                        company_name: string
                        logo_url?: string
                      }
                    }
                    return (
                      <Card key={appData.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                                <Building2 className="h-5 w-5 text-neutral-400" />
                              </div>
                              <div>
                                <Link
                                  href={`/roles/${role.id}`}
                                  className="font-medium hover:text-muted-foreground"
                                >
                                  {role.title}
                                </Link>
                                <p className="text-sm text-neutral-500">
                                  {role.startups?.company_name}
                                  {role.location && ` • ${role.location}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <ApplicationStatusBadge status={appData.status} />
                                <p className="text-xs text-dim mt-1">
                                  {formatRelativeTime(appData.created_at)}
                                </p>
                              </div>
                              <Link href={`/roles/${role.id}`}>
                                <ArrowRight className="h-4 w-4 text-dim" />
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Closed Applications */}
            {closedApps.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Past Applications</h2>
                <div className="space-y-3">
                  {closedApps.map((app: any) => {
                    const appData = app as any
                    const role = appData.roles as {
                      id: string
                      title: string
                      startups?: {
                        id: string
                        company_name: string
                      }
                    }
                    return (
                      <Card key={appData.id} className="opacity-60">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card-hover">
                                <Building2 className="h-5 w-5 text-dim" />
                              </div>
                              <div>
                                <p className="font-medium">{role.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {role.startups?.company_name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <ApplicationStatusBadge status={appData.status} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Browse open roles and apply to start your journey"
            action={
              <Link
                href="/roles"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
              >
                Browse roles
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        )}
      </div>
    </DashboardLayout>
  )
}
