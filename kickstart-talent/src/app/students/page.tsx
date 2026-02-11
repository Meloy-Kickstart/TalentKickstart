import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProfileCard } from '@/components/cards/profile-card'
import { EmptyState } from '@/components/cards/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, Search } from 'lucide-react'

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

  // Only startups and admins can view students
  if ((profile as any)?.role !== 'startup' && (profile as any)?.role !== 'admin') {
    redirect('/')
  }

  // Build query for students
  let query = supabase
    .from('students')
    .select(`
      *,
      profiles!inner (
        id,
        full_name,
        avatar_url,
        onboarding_completed
      ),
      student_skills (
        skills (
          id,
          name
        )
      )
    `)
    .eq('profiles.onboarding_completed', true)
    .order('updated_at', { ascending: false })

  // Apply filters
  const search = params.q as string
  const skillFilter = params.skill as string

  if (search) {
    query = query.or(`headline.ilike.%${search}%,looking_for.ilike.%${search}%,major.ilike.%${search}%`)
  }

  const { data: students } = await query

  // Get unique skills for filter
  const { data: popularSkills } = await supabase
    .from('skills')
    .select('id, name')
    .order('name')
    .limit(20)

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
          <h1 className="text-3xl font-bold mb-2 text-foreground">Browse Students</h1>
          <p className="text-muted-foreground">
            Discover talented students from Texas A&M who are ready to join your startup.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dim" />
            <Input
              name="q"
              placeholder="Search by headline, major, or interests..."
              defaultValue={search}
              className="pl-10"
            />
          </form>
        </div>

        {/* Popular Skills */}
        {popularSkills && (popularSkills as any).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-muted-foreground mr-2">Popular skills:</span>
            {(popularSkills as any).slice(0, 10).map((skill: any) => (
              <Link
                key={(skill as any).id}
                href={`/students?skill=${(skill as any).name}`}
              >
                <Badge
                  variant={skillFilter === (skill as any).name ? 'default' : 'outline'}
                  className="cursor-pointer"
                >
                  {(skill as any).name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Active Filters */}
        {(search || skillFilter) && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {search && (
              <Badge variant="secondary">"{search}"</Badge>
            )}
            {skillFilter && (
              <Badge variant="secondary">{skillFilter}</Badge>
            )}
            <Link href="/students">
              <Button variant="ghost" size="sm">Clear all</Button>
            </Link>
          </div>
        )}

        {/* Results */}
        {students && (students as any).length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {(students as any).length} student{(students as any).length !== 1 ? 's' : ''} available
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(students as any).map((student: any) => {
                const studentProfile = (student as any).profiles as {
                  id: string
                  full_name?: string
                  avatar_url?: string
                } | null
                const skills = ((student as any).student_skills as any)?.map(
                  (ss: any) => (ss as any).skills
                ) || []
                
                return (
                  <ProfileCard
                    key={(student as any).id}
                    id={(student as any).id}
                    name={(studentProfile as any)?.full_name || 'Anonymous'}
                    avatarUrl={(studentProfile as any)?.avatar_url}
                    headline={(student as any).headline}
                    university={(student as any).university || 'Texas A&M University'}
                    graduationYear={(student as any).graduation_year}
                    major={(student as any).major}
                    skills={(skills as any).slice(0, 5)}
                    isAvailable={(student as any).is_available || false}
                  />
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No students found"
            description={
              search || skillFilter
                ? "Try adjusting your filters or search terms"
                : "Check back soon for new talent"
            }
            action={
              (search || skillFilter) && (
                <Button asChild variant="outline">
                  <Link href="/students">Clear filters</Link>
                </Button>
              )
            }
          />
        )}
      </div>
    </DashboardLayout>
  )
}
