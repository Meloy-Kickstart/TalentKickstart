import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RoleCard } from '@/components/cards/role-card'
import { EmptyState } from '@/components/cards/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Briefcase, Search, Filter } from 'lucide-react'
import { RoleFilters } from '@/components/roles/role-filters'

export const dynamic = 'force-dynamic'

interface RolesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let savedRoles: string[] = []

  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = profileData

    // Get saved roles for this user
    const { data: savedData } = await supabase
      .from('saved_roles')
      .select('role_id')
      .eq('student_id', user.id)

    savedRoles = (savedData as any)?.map((s: any) => s.role_id) || []
  }

  // Build query
  let query = supabase
    .from('roles')
    .select(`
      *,
      startups!inner (
        id,
        company_name,
        logo_url,
        website,
        stage,
        team_size,
        is_verified
      ),
      role_skills (
        skills (
          id,
          name
        )
      )
    `)
    .eq('is_active', true)
    .eq('startups.is_verified', true)
    .order('created_at', { ascending: false })

  // Apply filters from search params
  const roleType = params.type as string
  const location = params.location as string
  const search = params.q as string

  if (roleType) {
    query = query.eq('role_type', roleType)
  }

  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data: roles } = await query

  // Get unique role types for filter
  const roleTypes = ['full_time', 'part_time', 'internship', 'contract']

  const userData = user && profile ? {
    id: user.id,
    email: user.email!,
    fullName: (profile as any)?.full_name,
    avatarUrl: (profile as any)?.avatar_url,
    role: (profile as any)?.role as 'student' | 'startup' | 'admin',
  } : undefined

  return (
    <DashboardLayout user={userData as any}>
      <div className="container py-8">
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Role</h1>
          <p className="text-black">
            Discover opportunities at innovative startups. All roles are at verified TAMU-affiliated or partner startups.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search roles by title, skills, or description..."
              defaultValue={search}
              className="pl-10"
            />
          </form>
          <RoleFilters roleTypes={roleTypes} />
        </div>

        {/* Active Filters */}
        {(roleType || location || search) && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {roleType && (
              <Badge variant="secondary" className="capitalize">
                {roleType.replace('_', ' ')}
              </Badge>
            )}
            {location && (
              <Badge variant="secondary">{location}</Badge>
            )}
            {search && (
              <Badge variant="secondary">"{search}"</Badge>
            )}
            <Link href="/roles">
              <Button variant="ghost" size="sm">Clear all</Button>
            </Link>
          </div>
        )}

        {/* Results */}
        {roles && roles.length > 0 ? (
          <>
            <p className="text-sm text-black mb-4">
              {roles.length} role{roles.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {((roles as any[]) || []).map((role: any) => {
                const startup = (role as any).startups as {
                  id: string
                  company_name: string
                  logo_url?: string
                  website?: string
                  stage?: string
                  team_size?: string
                }
                const skills = ((role as any).role_skills as { skills: { id: string; name: string } }[])?.map(
                  rs => rs.skills
                ) || []

                return (
                  <RoleCard
                    key={(role as any).id}
                    id={(role as any).id}
                    title={(role as any).title}
                    roleType={(role as any).role_type}
                    location={(role as any).location}
                    locationType={(role as any).is_remote ? 'remote' : 'onsite'}
                    salaryMin={(role as any).salary_min}
                    salaryMax={(role as any).salary_max}
                    description={(role as any).description}
                    createdAt={(role as any).created_at}
                    startup={{
                      id: startup.id,
                      companyName: startup.company_name,
                      logoUrl: startup.logo_url,
                      tagline: undefined,
                    }}
                    skills={skills}
                    {...((profile as any)?.role === 'student' ? {} : {})}
                  />
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No roles found"
            description={
              search || roleType || location
                ? "Try adjusting your filters or search terms"
                : "Check back soon for new opportunities"
            }
            action={
              (search || roleType || location) && (
                <Button asChild variant="outline">
                  <Link href="/roles">Clear filters</Link>
                </Button>
              )
            }
          />
        )}
      </div>
    </DashboardLayout>
  )
}
