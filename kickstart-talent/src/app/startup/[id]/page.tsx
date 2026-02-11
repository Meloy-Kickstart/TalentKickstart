import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatUrl } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RoleCard } from '@/components/cards/role-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Building2,
    MapPin,
    Users,
    Globe,
    Calendar,
    ExternalLink,
    CheckCircle,
    ArrowLeft
} from 'lucide-react'

interface StartupPageProps {
    params: Promise<{ id: string }>
}

export default async function StartupPage({ params }: StartupPageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch current user and profile
    const { data: { user } } = await supabase.auth.getUser()
    let profile = null
    if (user) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        profile = profileData
    }

    // Fetch startup with roles
    const { data: startup } = await supabase
        .from('startups')
        .select(`
      *,
      roles (
        id,
        title,
        role_type,
        location_type,
        location,
        is_active,
        created_at,
        salary_min,
        salary_max,
        role_skills (
          skills (
            id,
            name
          )
        )
      )
    `)
        .eq('id', id)
        .single()

    if (!startup) notFound()

    const startupData = startup as any

    // Only show if verified (unless viewing own startup or is admin)
    if (!startupData.is_verified) {
        if (!user || (startupData.id !== user.id && (profile as any)?.role !== 'admin')) {
            notFound()
        }
    }

    const activeRoles = (startupData.roles as any[])?.filter(r => r.is_active) || []

    const userData = user && profile ? {
        id: user.id,
        email: user.email!,
        fullName: (profile as any).full_name,
        avatarUrl: (profile as any).avatar_url,
        role: (profile as any).role as 'student' | 'startup' | 'admin',
    } : undefined

    return (
        <DashboardLayout user={userData as any}>
            <div className="container py-8">
                {/* Back Button */}
                <Link
                    href="/startups"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to all startups
                </Link>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <Card className="overflow-hidden border-edge bg-card/50 backdrop-blur-sm">
                            <div className="h-32 bg-gradient-to-r from-maroon-900/40 to-black/40" />
                            <CardContent className="relative pt-0 pb-6">
                                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-4 px-2">
                                    <Avatar className="h-24 w-24 rounded-2xl border-4 border-background shadow-xl">
                                        <AvatarImage src={startupData.logo_url} alt={startupData.company_name} />
                                        <AvatarFallback className="text-2xl rounded-2xl bg-card-hover text-muted">
                                            {getInitials(startupData.company_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 pb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h1 className="text-3xl font-bold tracking-tight">{startupData.company_name}</h1>
                                            {startupData.is_verified && (
                                                <Badge variant="success" className="bg-green-500/10 text-green-500 border-green-500/20">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                        {startupData.tagline && (
                                            <p className="text-lg text-muted-foreground mt-1">{startupData.tagline}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">About the company</h3>
                                        <div className="prose prose-invert max-w-none">
                                            {startupData.description ? (
                                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                    {startupData.description}
                                                </p>
                                            ) : (
                                                <p className="text-dim italic">No description provided.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Open Roles */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                Open Roles
                                <Badge variant="secondary" className="font-normal">
                                    {activeRoles.length}
                                </Badge>
                            </h2>
                            {activeRoles.length > 0 ? (
                                <div className="grid gap-4">
                                    {activeRoles.map((role) => (
                                        <RoleCard
                                            key={role.id}
                                            id={role.id}
                                            title={role.title}
                                            startup={{
                                                id: startupData.id,
                                                companyName: startupData.company_name,
                                                logoUrl: startupData.logo_url,
                                                tagline: startupData.tagline
                                            }}
                                            location={role.location}
                                            roleType={role.role_type}
                                            salaryMin={role.salary_min}
                                            salaryMax={role.salary_max}
                                            createdAt={role.created_at}
                                            skills={role.role_skills?.map((rs: any) => rs.skills) || []}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-dashed bg-transparent">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <Building2 className="h-12 w-12 text-dim mb-4" />
                                        <h3 className="font-medium">No open roles right now</h3>
                                        <p className="text-sm text-dim mt-1">Check back later for new opportunities at {startupData.company_name}.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-edge bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Company Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {startupData.industry && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-hover shrink-0">
                                                <Building2 className="h-4 w-4 text-muted" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-dim uppercase tracking-wider font-semibold">Industry</p>
                                                <p className="text-foreground">{startupData.industry}</p>
                                            </div>
                                        </div>
                                    )}
                                    {startupData.stage && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-hover shrink-0">
                                                <Calendar className="h-4 w-4 text-muted" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-dim uppercase tracking-wider font-semibold">Stage</p>
                                                <p className="text-foreground capitalize">{startupData.stage.replace('-', ' ')}</p>
                                            </div>
                                        </div>
                                    )}
                                    {startupData.team_size && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-hover shrink-0">
                                                <Users className="h-4 w-4 text-muted" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-dim uppercase tracking-wider font-semibold">Team Size</p>
                                                <p className="text-foreground">{startupData.team_size} employees</p>
                                            </div>
                                        </div>
                                    )}
                                    {startupData.location && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-hover shrink-0">
                                                <MapPin className="h-4 w-4 text-muted" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-dim uppercase tracking-wider font-semibold">Location</p>
                                                <p className="text-foreground">{startupData.location}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {startupData.website && (
                                    <div className="pt-4 border-t border-edge">
                                        <Button asChild variant="outline" className="w-full justify-between">
                                            <a href={formatUrl(startupData.website)} target="_blank" rel="noopener noreferrer">
                                                Visit Website
                                                <ExternalLink className="h-4 w-4 ml-2" />
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Need help/Contact (Optional) */}
                        <Card className="border-edge bg-maroon-950/20 backdrop-blur-sm">
                            <CardContent className="pt-6">
                                <h3 className="font-semibold mb-2">Interested in {startupData.company_name}?</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Keep an eye on their open roles and make sure your profile is up to date to increase your chances!
                                </p>
                                <Button asChild className="w-full bg-maroon-600 hover:bg-maroon-700">
                                    <Link href="/student/profile">Update My Profile</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
