import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { Users, Mail, User as UserIcon, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

interface StudentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Only admins can view this page
  if ((profile as any)?.role !== 'admin') {
    redirect('/')
  }

  // Build query for all profiles
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply filters
  const search = params.q as string
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: allUsers } = await query

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
        <div className="max-w-3xl mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all users signed up on the platform.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#500000]/10">
                  <Users className="h-6 w-6 text-[#500000]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{(allUsers as any)?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Students</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(allUsers as any)?.filter((u: any) => u.role === 'student').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Startups</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(allUsers as any)?.filter((u: any) => u.role === 'startup').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form className="flex-1 relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dim" />
            <input
              name="q"
              placeholder="Search by name or email..."
              defaultValue={search}
              className="w-full bg-[#500000]/5 border border-[#500000]/10 rounded-lg py-2 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-[#500000]/20 transition-all"
            />
          </form>
        </div>

        {/* Users Table */}
        <div className="glass-panel overflow-hidden rounded-xl border border-[#500000]/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#500000]/10 bg-[#500000]/5 text-[#500000]">
                  <th className="px-6 py-4 text-sm font-semibold">User</th>
                  <th className="px-6 py-4 text-sm font-semibold">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold">Onboarding</th>
                  <th className="px-6 py-4 text-sm font-semibold">Joined</th>
                  <th className="px-6 py-4 text-sm font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#500000]/5">
                {(allUsers as any)?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-[#500000]/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-[#500000]/10">
                          <AvatarImage src={u.avatar_url} />
                          <AvatarFallback className="bg-[#500000] text-white">
                            {getInitials(u.full_name || u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-[#500000] transition-colors">
                            {u.full_name || 'No Name'}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`capitalize ${u.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : u.role === 'startup'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            : 'bg-green-500/10 text-green-600 border-green-500/20'
                          }`}
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {u.onboarding_completed ? (
                        <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                          <XCircle className="h-4 w-4" />
                          <span>Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="secondary" className="cursor-pointer hover:bg-[#500000]/10 transition-colors">
                        Manage
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!allUsers || allUsers.length === 0) && (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-dim mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No users found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
