import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkillBadge } from '@/components/cards/skill-badge'
import { formatDate, formatSalary } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Users,
  Globe,
  Briefcase,
  ExternalLink,
  FileText,
} from 'lucide-react'
import { ApplyButton } from './apply-button'

interface RoleDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let student: any = null
  let hasApplied = false
  let isSaved = false

  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = profileData

    // Check if already applied
    const { data: application } = await supabase
      .from('applications')
      .select('id')
      .eq('role_id', id)
      .eq('student_id', user.id)
      .single()
    hasApplied = !!application

    // Check if saved
    const { data: saved } = await supabase
      .from('saved_roles')
      .select('id')
      .eq('role_id', id)
      .eq('student_id', user.id)
      .single()
    isSaved = !!saved

    // Fetch student info for resume
    const { data: studentData } = await supabase
      .from('students')
      .select('resume_url')
      .eq('id', user.id)
      .single()
    student = studentData
  }

  // Fetch role with startup info
  const { data: role } = await supabase
    .from('roles')
    .select(`
      *,
      startups (
        id,
        company_name,
        logo_url,
        website,
        description,
        stage,
        team_size,
        industry,
        location,
        is_verified
      ),
      role_skills (
        skills (
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!role) notFound()

  const roleData = role as any
  const profileData = profile as any

  const startup = roleData.startups as {
    id: string
    company_name: string
    logo_url?: string
    website?: string
    description?: string
    stage?: string
    team_size?: string
    industry?: string
    location?: string
    is_verified: boolean
  }

  // Only show if active and verified (unless viewing own role)
  if (!roleData.is_active || !startup.is_verified) {
    if (!user || startup.id !== user.id) {
      notFound()
    }
  }

  const skills = (roleData.role_skills as { skills: { id: string; name: string } }[])?.map(
    rs => rs.skills
  ) || []

  const userData = user && profile ? {
    id: user.id,
    email: user.email!,
    fullName: profileData?.full_name,
    avatarUrl: profileData?.avatar_url,
    role: profileData?.role as 'student' | 'startup' | 'admin',
  } : undefined

  return (
    <DashboardLayout user={userData as any}>
      <div className="container py-8">
        {/* Back button */}
        <Link
          href="/roles"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to all roles
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {startup.logo_url ? (
                    <Image
                      src={startup.logo_url}
                      alt={startup.company_name}
                      width={64}
                      height={64}
                      className="rounded-xl"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-100">
                      <Building2 className="h-8 w-8 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-1">{roleData.title}</h1>
                    <Link
                      href={`/startup/${startup.id}`}
                      className="text-neutral-500 hover:text-neutral-900"
                    >
                      {startup.company_name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutral-500">
                      {roleData.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {roleData.location}
                          {roleData.is_remote && ' (Remote OK)'}
                        </span>
                      )}
                      {roleData.role_type && (
                        <span className="flex items-center gap-1 capitalize">
                          <Briefcase className="h-4 w-4" />
                          {roleData.role_type.replace('_', ' ')}
                        </span>
                      )}
                      {(roleData.salary_min || roleData.salary_max) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(roleData.salary_min, roleData.salary_max)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-neutral max-w-none">
                  {roleData.description ? (
                    <div className="whitespace-pre-wrap">{roleData.description}</div>
                  ) : (
                    <p className="text-neutral-400">No description provided</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {roleData.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral max-w-none whitespace-pre-wrap">
                    {roleData.requirements}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <SkillBadge key={skill.id} name={skill.name} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
              <CardContent className="pt-6">
                {profileData?.role === 'student' ? (
                  <>
                    <ApplyButton
                      roleId={roleData.id}
                      hasApplied={hasApplied}
                      isSaved={isSaved}
                    />
                    <p className="text-xs text-neutral-400 text-center mt-3">
                      Posted {formatDate(roleData.created_at)}
                    </p>
                    {student?.resume_url && !hasApplied && (
                      <div className="mt-4 pt-4 border-t border-neutral-100 italic">
                        <p className="text-xs text-neutral-500 mb-2">
                          Applying with your profile resume:
                        </p>
                        <a
                          href={student.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#500000] hover:underline flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          View Current Resume
                        </a>
                      </div>
                    )}
                  </>
                ) : user ? (
                  <p className="text-sm text-neutral-500 text-center">
                    Sign in as a student to apply
                  </p>
                ) : (
                  <div className="space-y-3">
                    <Button asChild className="w-full">
                      <Link href="/signup?role=student">Sign up to apply</Link>
                    </Button>
                    <p className="text-xs text-neutral-400 text-center">
                      Already have an account?{' '}
                      <Link href="/login" className="text-neutral-600 hover:underline">
                        Log in
                      </Link>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {startup.company_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {startup.description && (
                  <p className="text-sm text-neutral-600">{startup.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  {startup.industry && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-neutral-400" />
                      <span>{startup.industry}</span>
                    </div>
                  )}
                  {startup.stage && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      <span className="capitalize">{startup.stage.replace('_', ' ')}</span>
                    </div>
                  )}
                  {startup.team_size && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-neutral-400" />
                      <span>{startup.team_size} employees</span>
                    </div>
                  )}
                  {startup.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-neutral-400" />
                      <span>{startup.location}</span>
                    </div>
                  )}
                  {startup.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-neutral-400" />
                      <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                      >
                        Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/startup/${startup.id}`}>View company profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
