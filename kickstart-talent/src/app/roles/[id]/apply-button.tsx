'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { applyToRole, withdrawApplication, saveRole, unsaveRole } from '@/lib/actions/applications'
import { Loader2, Send, Bookmark, BookmarkCheck, X } from 'lucide-react'

interface ApplyButtonProps {
  roleId: string
  hasApplied: boolean
  isSaved: boolean
}

export function ApplyButton({ roleId, hasApplied, isSaved }: ApplyButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleApply = () => {
    startTransition(async () => {
      await applyToRole(roleId)
      router.refresh()
    })
  }

  const handleWithdraw = () => {
    if (!confirm('Are you sure you want to withdraw your application?')) return
    startTransition(async () => {
      await withdrawApplication(roleId)
      router.refresh()
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      if (isSaved) {
        await unsaveRole(roleId)
      } else {
        await saveRole(roleId)
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {hasApplied ? (
        <>
          <Button disabled className="w-full" variant="secondary">
            <Send className="h-4 w-4 mr-2" />
            Application Submitted
          </Button>
          <Button
            variant="ghost"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleWithdraw}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            Withdraw Application
          </Button>
        </>
      ) : (
        <Button onClick={handleApply} disabled={isPending} className="w-full">
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Apply Now
        </Button>
      )}
      <Button
        variant="outline"
        onClick={handleSave}
        disabled={isPending}
        className="w-full"
      >
        {isSaved ? (
          <>
            <BookmarkCheck className="h-4 w-4 mr-2" />
            Saved
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4 mr-2" />
            Save for Later
          </>
        )}
      </Button>
    </div>
  )
}
