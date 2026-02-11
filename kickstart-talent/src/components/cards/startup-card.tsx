import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import { MapPin, Users, ExternalLink, Building2 } from "lucide-react"
import Link from "next/link"

interface StartupCardProps {
  id: string
  companyName: string
  tagline?: string | null
  logoUrl?: string | null
  stage?: string | null
  industry?: string | null
  teamSize?: string | null
  location?: string | null
  website?: string | null
  isVerified?: boolean
  roleCount?: number
}

const stageLabels: Record<string, string> = {
  'idea': 'Idea Stage',
  'pre-seed': 'Pre-Seed',
  'seed': 'Seed',
  'series-a': 'Series A',
  'series-b': 'Series B',
  'growth': 'Growth',
}

export function StartupCard({
  id,
  companyName,
  tagline,
  logoUrl,
  stage,
  industry,
  teamSize,
  location,
  website,
  isVerified,
  roleCount,
}: StartupCardProps) {
  return (
    <Link href={`/startup/${id}`}>
      <Card className="hover:border-muted transition-colors cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 rounded-xl">
              <AvatarImage src={logoUrl || undefined} alt={companyName} />
              <AvatarFallback className="rounded-xl bg-card-hover">
                {getInitials(companyName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{companyName}</h3>
                {isVerified && (
                  <Badge variant="success" className="text-xs">Verified</Badge>
                )}
              </div>

              {tagline && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tagline}</p>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {stage && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {stageLabels[stage] || stage}
                  </Badge>
                )}
                {industry && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {industry}
                  </span>
                )}
                {teamSize && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {teamSize} employees
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location}
                  </span>
                )}
              </div>

              {roleCount !== undefined && roleCount > 0 && (
                <p className="mt-3 text-sm font-medium text-maroon-400">
                  {roleCount} open {roleCount === 1 ? 'role' : 'roles'}
                </p>
              )}
            </div>

            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dim hover:text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
