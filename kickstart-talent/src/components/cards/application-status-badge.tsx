import { Badge } from "@/components/ui/badge"

type ApplicationStatus = 'applied' | 'viewed' | 'interview' | 'offer' | 'accepted' | 'rejected' | 'withdrawn'

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus
}

const statusConfig: Record<ApplicationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' }> = {
  applied: { label: 'Applied', variant: 'secondary' },
  viewed: { label: 'Viewed', variant: 'info' },
  interview: { label: 'Interview', variant: 'warning' },
  offer: { label: 'Offer', variant: 'success' },
  accepted: { label: 'Accepted', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  withdrawn: { label: 'Withdrawn', variant: 'secondary' },
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}
