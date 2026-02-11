'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { updateApplicationStatus } from '@/lib/actions/applications'
import {
  Eye,
  MessageSquare,
  Gift,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'

type ApplicationStatus = 'applied' | 'viewed' | 'interview' | 'offer' | 'accepted' | 'rejected' | 'withdrawn'

interface ApplicationActionsProps {
  applicationId: string
  currentStatus: ApplicationStatus
}

const nextActions: Record<ApplicationStatus, { label: string; status: ApplicationStatus; icon: React.ReactNode; variant: 'default' | 'outline' | 'destructive' }[]> = {
  applied: [
    { label: 'Mark Viewed', status: 'viewed', icon: <Eye className="h-3.5 w-3.5 mr-1" />, variant: 'outline' },
    { label: 'Reject', status: 'rejected', icon: <XCircle className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' },
  ],
  viewed: [
    { label: 'Interview', status: 'interview', icon: <MessageSquare className="h-3.5 w-3.5 mr-1" />, variant: 'default' },
    { label: 'Reject', status: 'rejected', icon: <XCircle className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' },
  ],
  interview: [
    { label: 'Make Offer', status: 'offer', icon: <Gift className="h-3.5 w-3.5 mr-1" />, variant: 'default' },
    { label: 'Reject', status: 'rejected', icon: <XCircle className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' },
  ],
  offer: [
    { label: 'Accept', status: 'accepted', icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />, variant: 'default' },
    { label: 'Reject', status: 'rejected', icon: <XCircle className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' },
  ],
  accepted: [],
  rejected: [],
  withdrawn: [],
}

export function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
  const [isPending, startTransition] = useTransition()
  const actions = nextActions[currentStatus] || []

  if (actions.length === 0) return null

  function handleAction(status: ApplicationStatus) {
    startTransition(async () => {
      await updateApplicationStatus(applicationId, status as any)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          variant={action.variant}
          size="sm"
          disabled={isPending}
          onClick={() => handleAction(action.status)}
          className="text-xs"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            action.icon
          )}
          {action.label}
        </Button>
      ))}
    </div>
  )
}
