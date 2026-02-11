import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SkillBadge } from "./skill-badge"
import { getInitials, formatSalary, formatRelativeTime } from "@/lib/utils"
import { MapPin, Clock, DollarSign, Percent, Briefcase } from "lucide-react"
import Link from "next/link"

interface RoleCardProps {
  id: string
  title: string
  description?: string | null
  roleType?: string | null
  jobFunction?: string | null
  paid?: boolean
  salaryMin?: number | null
  salaryMax?: number | null
  equity?: boolean
  equityRange?: string | null
  locationType?: string | null
  location?: string | null
  duration?: string | null
  createdAt: string
  startup: {
    id: string
    companyName: string
    logoUrl?: string | null
    tagline?: string | null
  }
  skills?: { name: string }[]
  compact?: boolean
  showApplyButton?: boolean
  onApply?: () => void
  hasApplied?: boolean
}

const roleTypeLabels: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'internship': 'Internship',
  'contract': 'Contract',
  'cofounder': 'Co-founder',
}

export function RoleCard({
  id,
  title,
  description,
  roleType,
  paid,
  salaryMin,
  salaryMax,
  equity,
  equityRange,
  locationType,
  location,
  duration,
  createdAt,
  startup,
  skills = [],
  compact = false,
  showApplyButton = false,
  onApply,
  hasApplied = false,
}: RoleCardProps) {
  return (
    <Card className="hover:border-muted transition-colors">
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex items-start gap-4">
          <Link href={`/startup/${startup.id}`}>
            <Avatar className={`${compact ? 'h-10 w-10' : 'h-12 w-12'} rounded-xl`}>
              <AvatarImage src={startup.logoUrl || undefined} alt={startup.companyName} />
              <AvatarFallback className="rounded-xl bg-muted/40 text-muted-foreground">
                {getInitials(startup.companyName)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/roles/${id}`}>
              <h3 className={`font-semibold text-foreground hover:text-muted-foreground ${compact ? 'text-base' : 'text-lg'}`}>
                {title}
              </h3>
            </Link>

            <Link href={`/startup/${startup.id}`}>
              <p className="text-sm text-muted-foreground hover:text-foreground mb-2">
                {startup.companyName}
                {startup.tagline && ` — ${startup.tagline}`}
              </p>
            </Link>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
              {roleType && (
                <Badge variant="secondary" className="text-xs font-normal">
                  {roleTypeLabels[roleType] || roleType}
                </Badge>
              )}

              {(paid || salaryMin || salaryMax) && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatSalary(salaryMin, salaryMax)}
                </span>
              )}

              {equity && (
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  {equityRange || 'Equity'}
                </span>
              )}

              {locationType && (
                <span className="flex items-center gap-1 capitalize">
                  <MapPin className="h-3 w-3" />
                  {locationType}
                  {location && ` • ${location}`}
                </span>
              )}

              {duration && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {duration}
                </span>
              )}

              <span className="flex items-center gap-1 text-muted-foreground/80">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(createdAt)}
              </span>
            </div>

            {!compact && description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
            )}

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, compact ? 3 : 5).map((skill) => (
                  <SkillBadge key={skill.name} name={skill.name} className="text-xs py-0.5 px-2" />
                ))}
                {skills.length > (compact ? 3 : 5) && (
                  <span className="text-xs text-muted-foreground/70">+{skills.length - (compact ? 3 : 5)} more</span>
                )}
              </div>
            )}
          </div>

          {showApplyButton && (
            <div className="flex-shrink-0">
              {hasApplied ? (
                <Badge variant="secondary">Applied</Badge>
              ) : (
                <Button size="sm" onClick={onApply}>
                  Apply
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
