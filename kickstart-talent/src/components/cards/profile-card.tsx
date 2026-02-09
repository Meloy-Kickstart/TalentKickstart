import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SkillBadge } from "./skill-badge"
import { getInitials } from "@/lib/utils"
import { MapPin, GraduationCap, Github, Globe, Briefcase } from "lucide-react"
import Link from "next/link"

interface ProfileCardProps {
  id: string
  name: string
  headline?: string | null
  avatarUrl?: string | null
  major?: string | null
  graduationYear?: number | null
  university?: string
  location?: string | null
  isAvailable?: boolean
  skills?: { name: string }[]
  githubUrl?: string | null
  portfolioUrl?: string | null
}

export function ProfileCard({
  id,
  name,
  headline,
  avatarUrl,
  major,
  graduationYear,
  university,
  location,
  isAvailable,
  skills = [],
  githubUrl,
  portfolioUrl,
}: ProfileCardProps) {
  return (
    <Link href={`/talent/${id}`}>
      <Card className="hover:border-muted transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={avatarUrl || undefined} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{name}</h3>
                {isAvailable && (
                  <Badge variant="success" className="text-xs">Available</Badge>
                )}
              </div>
              
              {headline && (
                <p className="text-sm text-muted mb-2 line-clamp-1">{headline}</p>
              )}
              
              <div className="flex flex-wrap gap-3 text-xs text-muted mb-3">
                {major && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    {major} {graduationYear && `'${graduationYear.toString().slice(-2)}`}
                  </span>
                )}
                {university && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {university}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location}
                  </span>
                )}
              </div>
              
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 4).map((skill) => (
                    <SkillBadge key={skill.name} name={skill.name} className="text-xs py-0.5 px-2" />
                  ))}
                  {skills.length > 4 && (
                    <span className="text-xs text-dim">+{skills.length - 4} more</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dim hover:text-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {portfolioUrl && (
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dim hover:text-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
