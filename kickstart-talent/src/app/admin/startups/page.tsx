import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import {
  Building2,
  CheckCircle,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  Users,
} from 'lucide-react'

export default async function AdminStartupsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') redirect('/')

  // Fetch all startups
  const { data: startups } = await supabase
    .from('startups')
    .select(`
      *,
      profiles (
        full_name,
        email
      ),
      roles (count)
    `)
    .order('is_verified', { ascending: true })
    .order('created_at', { ascending: false })

  const userData = {
    id: user.id,
    email: user.email!,
    fullName: (profile as any)?.full_name,
    avatarUrl: (profile as any)?.avatar_url,
    role: (profile as any)?.role as 'student' | 'startup' | 'admin',
  }

  const pendingStartups = (startups as any)?.filter((s: any) => !(s as any).is_verified) || []
  const verifiedStartups = (startups as any)?.filter((s: any) => (s as any).is_verified) || []

  return (
    <DashboardLayout user={userData}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Manage Startups</h1>
          <p className="text-muted-foreground">
            Review and verify startup accounts
          </p>
        </div>

        {/* Pending Verifications */}
        {(pendingStartups as any).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Verification ({(pendingStartups as any).length})
            </h2>
            <div className="space-y-4">
              {(pendingStartups as any).map((startup: any) => {
                const contact = startup.profiles as { full_name?: string; email?: string } | null
                const roleCount = (startup.roles as { count: number }[])?.[0]?.count || 0
                return (
                  <Card key={(startup as any).id}>
                    <CardContent className="py-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card-hover">
                            <Building2 className="h-6 w-6 text-dim" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{(startup as any).company_name}</h3>
                              <Badge variant="warning">Pending</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {(contact as any)?.full_name} • {(contact as any)?.email}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              {(startup as any).industry && <span>{(startup as any).industry}</span>}
                              {(startup as any).stage && (
                                <span className="capitalize">{(startup as any).stage.replace('_', ' ')}</span>
                              )}
                              {(startup as any).location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {(startup as any).location}
                                </span>
                              )}
                              {(startup as any).website && (
                                <a
                                  href={(startup as any).website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 hover:text-foreground"
                                >
                                  <Globe className="h-3 w-3" />
                                  Website
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            {(startup as any).description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {(startup as any).description}
                              </p>
                            )}
                            <p className="text-xs text-dim mt-2">
                              Applied {formatRelativeTime((startup as any).created_at)}
                            </p>
                          </div>
                        </div>
                        <Button asChild>
                          <Link href={`/admin/startups/${(startup as any).id}`}>
                            Review
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Verified Startups */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Verified Startups ({(verifiedStartups as any).length})
          </h2>
          {(verifiedStartups as any).length > 0 ? (
            <div className="space-y-4">
              {(verifiedStartups as any).map((startup: any) => {
                const contact = startup.profiles as { full_name?: string; email?: string } | null
                const roleCount = (startup.roles as { count: number }[])?.[0]?.count || 0
                return (
                  <Card key={(startup as any).id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card-hover">
                            <Building2 className="h-5 w-5 text-dim" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{(startup as any).company_name}</h3>
                              <Badge variant="success">Verified</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {(contact as any)?.email} • {roleCount} roles
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/startups/${(startup as any).id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <p className="text-dim text-center py-8">
              No verified startups yet
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
