'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { verifyStartup, declineStartup } from '@/lib/actions/admin'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface VerifyButtonProps {
  startupId: string
  isVerified: boolean
}

export function VerifyButton({ startupId, isVerified }: VerifyButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false)

  const handleVerify = (verified: boolean) => {
    startTransition(async () => {
      await verifyStartup(startupId, verified)
      router.refresh()
    })
  }

  const handleDecline = () => {
    startTransition(async () => {
      const result = await declineStartup(startupId)
      if (result.success) {
        router.push('/admin/startups')
      } else {
        alert(result.error || 'Failed to decline startup')
        setShowDeclineConfirm(false)
      }
    })
  }

  if (isVerified) {
    return (
      <Button
        variant="destructive"
        onClick={() => handleVerify(false)}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4 mr-2" />
        )}
        Revoke Verification
      </Button>
    )
  }

  if (showDeclineConfirm) {
    return (
      <div className="flex items-center gap-2 bg-destructive/10 p-1.5 rounded-lg border border-destructive/20 animate-in fade-in zoom-in-95 duration-200">
        <span className="text-sm font-medium text-destructive px-2 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4" />
          Are you sure?
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDecline}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm Decline'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-600"
          onClick={() => setShowDeclineConfirm(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
        onClick={() => setShowDeclineConfirm(true)}
        disabled={isPending}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Decline
      </Button>
      <Button
        onClick={() => handleVerify(true)}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-2" />
        )}
        Verify Startup
      </Button>
    </div>
  )
}
