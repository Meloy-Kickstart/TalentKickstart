'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { verifyStartup } from '@/lib/actions/admin'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface VerifyButtonProps {
  startupId: string
  isVerified: boolean
}

export function VerifyButton({ startupId, isVerified }: VerifyButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleVerify = (verified: boolean) => {
    startTransition(async () => {
      await verifyStartup(startupId, verified)
      router.refresh()
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

  return (
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
  )
}
