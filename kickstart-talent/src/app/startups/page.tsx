import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StartupCard } from '@/components/cards/startup-card'
import { EmptyState } from '@/components/cards/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Building2, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface StartupsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function StartupsPage({ searchParams }: StartupsPageProps) {
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

  // Build query for startups - only show verified startups to non-admins
  let query = supabase
    .from('startups')
    .select(`
      *,
      profiles!inner (
        id,
        full_name,
        avatar_url,
        onboarding_completed
      ),
      roles (
        id,
        title,
        is_active
      )
    `)
    .eq('profiles.onboarding_completed', true)
    .order('created_at', { ascending: false })

  // Only show verified startups to non-admins
  if ((profile as any)?.role !== 'admin') {
    query = query.eq('is_verified', true)
  }

  // Apply search filter
  const search = params.q as string
  const industryFilter = params.industry as string

  if (search) {
    query = query.or(`company_name.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (industryFilter) {
    query = query.eq('industry', industryFilter)
  }

  const { data: startups } = await query

  // Get unique industries for filter
  const industries = [
    'AI / Machine Learning',
    'B2B Software',
    'Consumer',
    'Developer Tools',
    'E-commerce',
    'Education',
    'Fintech',
    'Healthcare',
    'SaaS',
  ]

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
          <h1 className="text-3xl font-bold mb-2 text-foreground">Browse Startups</h1>
          <p className="text-muted-foreground">
            Discover innovative startups looking for talented students like you.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dim" />
            <Input
              name="q"
              placeholder="Search startups by name or description..."
              defaultValue={search}
              className="pl-10"
            />
          </form>
        </div>

        {/* Industry Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-muted-foreground mr-2">Industries:</span>
          {industries.map((industry) => (
            <Link
              key={industry}
              href={industryFilter === industry ? '/startups' : `/startups?industry=${encodeURIComponent(industry)}`}
            >
              <Badge
                variant={industryFilter === industry ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                {industry}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Active Filters */}
        {(search || industryFilter) && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {search && (
              <Badge variant="secondary">"{search}"</Badge>
            )}
            {industryFilter && (
              <Badge variant="secondary">{industryFilter}</Badge>
            )}
            <Link href="/startups">
              <Button variant="ghost" size="sm">Clear all</Button>
            </Link>
          </div>
        )}

        {/* Results */}
        {startups && (startups as any).length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {(startups as any).length} startup{(startups as any).length !== 1 ? 's' : ''} found
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(startups as any).map((startup: any) => {
                const activeRoles = ((startup as any).roles as any[])?.filter(
                  (r: any) => r.is_active
                ) || []
                
                return (
                  <StartupCard
                    key={(startup as any).id}
                    id={(startup as any).id}
                    companyName={(startup as any).company_name}
                    tagline={(startup as any).tagline}
                    logoUrl={(startup as any).logo_url}
                    industry={(startup as any).industry}
                    stage={(startup as any).stage}
                    location={(startup as any).location}
                    teamSize={(startup as any).team_size}
                    roleCount={activeRoles.length}
                    isVerified={(startup as any).is_verified}
                  />
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Building2}
            title="No startups found"
            description={
              search || industryFilter
                ? "Try adjusting your filters or search terms"
                : "Check back soon for new startups"
            }
            action={
              (search || industryFilter) && (
                <Button asChild variant="outline">
                  <Link href="/startups">Clear filters</Link>
                </Button>
              )
            }
          />
        )}
      </div>
    </DashboardLayout>
  )
}
