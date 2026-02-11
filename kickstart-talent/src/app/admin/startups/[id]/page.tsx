import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { VerifyButton } from './verify-button'

interface AdminStartupDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminStartupDetailPage({ params }: AdminStartupDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') redirect('/')

  // Fetch startup with contact info
  const { data: startup } = await supabase
    .from('startups')
    .select(`
      *,
      profiles (
        id,
        full_name,
        email
      ),
      roles (
        id,
        title,
        is_active,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (!startup) notFound()

  const contact = (startup as any).profiles as { id: string; full_name?: string; email?: string } | null
  const roles = ((startup as any).roles as any) || []

  const userData = {
    id: user.id,
    email: user.email!,
    fullName: (profile as any)?.full_name,
    avatarUrl: (profile as any)?.avatar_url,
    role: (profile as any)?.role as 'student' | 'startup' | 'admin',
  }

  return (
    <DashboardLayout user={userData}>
      <div className="container py-8 max-w-4xl">
        {/* Back link */}
        <Link
          href="/admin/startups"
          className="inline-flex items-center text-sm text-neutral-600 hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1 text-neutral-500" />
          Back to startups
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-card-hover">
              <Building2 className="h-8 w-8 text-neutral-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{(startup as any).company_name}</h1>
                <Badge variant={(startup as any).is_verified ? 'success' : 'warning'}>
                  {(startup as any).is_verified ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-neutral-600">
                Registered {formatDate((startup as any).created_at)}
              </p>
            </div>
          </div>
          <VerifyButton startupId={(startup as any).id} isVerified={(startup as any).is_verified} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(startup as any).description && (
                <div>
                  <label className="text-sm font-medium text-neutral-600">Description</label>
                  <p className="mt-1">{(startup as any).description}</p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {(startup as any).industry && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Industry</label>
                    <p className="mt-1">{(startup as any).industry}</p>
                  </div>
                )}
                {(startup as any).stage && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Stage</label>
                    <p className="mt-1 capitalize">{(startup as any).stage.replace('_', ' ')}</p>
                  </div>
                )}
                {(startup as any).team_size && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Team Size</label>
                    <p className="mt-1 flex items-center gap-1">
                      <Users className="h-4 w-4 text-neutral-500" />
                      {(startup as any).team_size}
                    </p>
                  </div>
                )}
                {(startup as any).founded_year && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Founded</label>
                    <p className="mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-neutral-500" />
                      {(startup as any).founded_year}
                    </p>
                  </div>
                )}
                {(startup as any).location && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Location</label>
                    <p className="mt-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-neutral-500" />
                      {(startup as any).location}
                    </p>
                  </div>
                )}
                {(startup as any).website && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Website</label>
                    <a
                      href={(startup as any).website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      {(startup as any).website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-600">Name</label>
                <p className="mt-1">{(contact as any)?.full_name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Email</label>
                <a
                  href={`mailto:${(contact as any)?.email}`}
                  className="mt-1 flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {(contact as any)?.email}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Posted Roles ({(roles as any).length})</CardTitle>
            </CardHeader>
            <CardContent>
              {(roles as any).length > 0 ? (
                <div className="space-y-3">
                  {(roles as any).map((role: any) => (
                    <div
                      key={(role as any).id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{(role as any).title}</p>
                        <p className="text-sm text-neutral-600">
                          Created {formatDate((role as any).created_at)}
                        </p>
                      </div>
                      <Badge variant={(role as any).is_active ? 'success' : 'secondary'}>
                        {(role as any).is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-4">
                  No roles posted yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
