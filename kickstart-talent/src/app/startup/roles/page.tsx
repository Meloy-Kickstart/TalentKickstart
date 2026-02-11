import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/cards/empty-state'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import {
  Plus,
  Briefcase,
  Settings,
  Users,
  Eye,
  MoreHorizontal,
} from 'lucide-react'

export default async function StartupRolesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'startup') redirect('/')

  // Fetch roles with application counts
  const { data: roles } = await supabase
    .from('roles')
    .select(`
      *,
      applications (count)
    `)
    .eq('startup_id', user.id)
    .order('created_at', { ascending: false })

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Roles</h1>
            <p className="text-muted-foreground">
              Manage your job postings and review applications
            </p>
          </div>
          <Button asChild>
            <Link href="/startup/roles/new">
              <Plus className="h-4 w-4 mr-2" />
              Post New Role
            </Link>
          </Button>
        </div>

        {roles && roles.length > 0 ? (
          <div className="space-y-4">
            {((roles as any[]) || []).map((role) => {
              const appCount = ((role as any).applications as { count: number }[])?.[0]?.count || 0
              return (
                <Card key={(role as any).id}>
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/startup/roles/${(role as any).id}`}
                            className="text-lg font-semibold hover:text-muted-foreground"
                          >
                            {(role as any).title}
                          </Link>
                          <Badge
                            variant={(role as any).is_active ? 'success' : 'secondary'}
                          >
                            {(role as any).is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {(role as any).role_type && (
                            <span className="capitalize">
                              {(role as any).role_type.replace('_', ' ')}
                            </span>
                          )}
                          {(role as any).location && <span>{(role as any).location}</span>}
                          {(role as any).is_remote && (
                            <Badge variant="outline" className="text-xs">
                              Remote OK
                            </Badge>
                          )}
                          <span>Posted {formatRelativeTime((role as any).created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-lg font-semibold">
                            <Users className="h-4 w-4 text-dim" />
                            {appCount}
                          </div>
                          <span className="text-xs text-dim">Applicants</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/startup/roles/${(role as any).id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/startup/roles/${(role as any).id}/edit`}>
                              <Settings className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
      </div>
    </DashboardLayout>
  )
}
