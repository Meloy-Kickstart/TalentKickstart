import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApplicationStatusBadge } from '@/components/cards/application-status-badge'
import { SkillBadge } from '@/components/cards/skill-badge'
import { formatDate, formatRelativeTime, formatSalary } from '@/lib/utils'
import Link from 'next/link'
import {
  ArrowLeft,
  Settings,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  FileText,
  ExternalLink,
  Mail,
} from 'lucide-react'
import { ApplicationActions } from './application-actions'

interface StartupRoleDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StartupRoleDetailPage({ params }: StartupRoleDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'startup') redirect('/')

  // Fetch the role with skills
  const { data: role } = await supabase
    .from('roles')
    .select(`
      *,
      role_skills (
        skills (
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .eq('startup_id', user.id)
    .single()

  if (!role) notFound()

  const roleData = role as any

  // Fetch applications for this role with student and profile info
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      students!inner (
        id,
        headline,
        bio,
        major,
        graduation_year,
        university,
        github_url,
        portfolio_url,
        resume_url,
        profiles!inner (
          full_name,
          email,
          avatar_url,
          linkedin_url
        )
      )
    `)
    .eq('role_id', id)
    .order('created_at', { ascending: false })

  const skills = (roleData.role_skills as { skills: { id: string; name: string } }[])?.map(
    rs => rs.skills
  ) || []

  const userData = {
    id: user.id,
    email: user.email!,
    fullName: (profile as any)?.full_name,
    avatarUrl: (profile as any)?.avatar_url,
    role: (profile as any)?.role as 'student' | 'startup' | 'admin',
  }

  const appList = (applications || []) as any[]

  return (
    <DashboardLayout user={userData}>
      <div className="container py-8">
        {/* Back button */}
        <Link
          href="/startup/roles"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to your roles
        </Link>

        {/* Role header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{roleData.title}</h1>
              <Badge variant={roleData.is_active ? 'success' : 'secondary'}>
                {roleData.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {roleData.role_type && (
                <span className="flex items-center gap-1 capitalize">
                  <Briefcase className="h-4 w-4" />
                  {roleData.role_type.replace('_', ' ')}
                </span>
              )}
              {roleData.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {roleData.location}
                </span>
              )}
              {(roleData.salary_min || roleData.salary_max) && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary(roleData.salary_min, roleData.salary_max)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Posted {formatRelativeTime(roleData.created_at)}
              </span>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/startup/roles/${id}/edit`}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Role
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Role details sidebar */}
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {roleData.description && (
                  <div>
                    <p className="font-medium mb-1">Description</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {roleData.description}
                    </p>
                  </div>
                )}
                {roleData.requirements && (
                  <div>
                    <p className="font-medium mb-1">Requirements</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {roleData.requirements}
                    </p>
                  </div>
                )}
                {skills.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <SkillBadge key={skill.id} name={skill.name} />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Applications list */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                Applications ({appList.length})
              </h2>
            </div>

            {appList.length > 0 ? (
              <div className="space-y-4">
                {appList.map((app) => {
                  const student = app.students
                  const studentProfile = student?.profiles

                  return (
                    <Card key={app.id}>
                      <CardContent className="py-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <Link
                                href={`/students/${student?.id}`}
                                className="text-base font-semibold hover:underline"
                              >
                                {studentProfile?.full_name || 'Unknown Student'}
                              </Link>
                              <ApplicationStatusBadge status={app.status} />
                            </div>

                            {student?.headline && (
                              <p className="text-sm text-muted-foreground mb-1">
                                {student.headline}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                              {student?.major && (
                                <span>{student.major}</span>
                              )}
                              {student?.graduation_year && (
                                <span>Class of {student.graduation_year}</span>
                              )}
                              {student?.university && (
                                <span>{student.university}</span>
                              )}
                              <span>Applied {formatRelativeTime(app.created_at)}</span>
                            </div>

                            {app.cover_letter && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Cover Letter
                                </p>
                                <p className="text-sm whitespace-pre-wrap">
                                  {app.cover_letter}
                                </p>
                              </div>
                            )}

                            {/* Quick links */}
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              {studentProfile?.email && (
                                <a
                                  href={`mailto:${studentProfile.email}`}
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <Mail className="h-3 w-3" />
                                  Email
                                </a>
                              )}
                              {studentProfile?.linkedin_url && (
                                <a
                                  href={studentProfile.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  LinkedIn
                                </a>
                              )}
                              {student?.resume_url && (
                                <a
                                  href={student.resume_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <FileText className="h-3 w-3" />
                                  Resume
                                </a>
                              )}
                              {student?.github_url && (
                                <a
                                  href={student.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  GitHub
                                </a>
                              )}
                              {student?.portfolio_url && (
                                <a
                                  href={student.portfolio_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Portfolio
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex-shrink-0">
                            <ApplicationActions
                              applicationId={app.id}
                              currentStatus={app.status}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">No applications yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Applications will appear here when students apply to this role.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
