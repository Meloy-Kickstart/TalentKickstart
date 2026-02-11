'use client'

import { useTransition, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface RoleFiltersProps {
    roleTypes: string[]
}

export function RoleFilters({ roleTypes }: RoleFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [pendingType, setPendingType] = useState<string | null>(null)

    const currentType = searchParams.get('type')

    const handleTypeClick = (type: string) => {
        if (isPending) return

        const isCurrentlyActive = currentType === type
        const nextType = isCurrentlyActive ? null : type

        setPendingType(type)

        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (nextType) {
                params.set('type', nextType)
            } else {
                params.delete('type')
            }
            router.push(`/roles?${params.toString()}`, { scroll: false })
        })
    }

    // Use useEffect to clear pending state when navigation completes
    useEffect(() => {
        if (!isPending) {
            setPendingType(null)
        }
    }, [isPending])

    return (
        <div className="flex gap-3 flex-wrap">
            {roleTypes.map((type) => {
                const isActive = currentType === type
                const isThisPending = isPending && pendingType === type
                const label = type.replace('_', '-')

                // Truly optimistic: if this button was clicked and is pending, 
                // it should look like its target state.
                const isOptimisticActive = isThisPending ? (currentType !== type) : isActive

                const isSpecial = type === 'internship' || type === 'part_time'

                return (
                    <button
                        key={type}
                        disabled={isPending}
                        onClick={() => handleTypeClick(type)}
                        className={cn(
                            "relative px-5 py-2 rounded-2xl text-sm font-medium transition-all duration-300 select-none overflow-hidden",
                            "border flex items-center gap-2",
                            isOptimisticActive
                                ? "bg-[#500000] text-white border-[#500000] shadow-lg shadow-[#500000]/20 scale-[1.02]"
                                : "glass bg-white/40 text-[#500000]/70 border-white/60 hover:border-[#500000]/30 hover:bg-white/60",
                            isThisPending && "opacity-90",
                            !isOptimisticActive && isSpecial && "hover:shadow-md hover:shadow-[#500000]/5"
                        )}
                    >
                        {isThisPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                isOptimisticActive ? "bg-white scale-110" : "bg-[#500000]/20"
                            )} />
                        )}

                        <span className="capitalize">{label}</span>

                        {/* Shimmer effect for active/loading states using inline style for simplicity if target doesn't have it */}
                        {isThisPending && (
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                style={{
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 2s linear infinite',
                                }}
                            />
                        )}

                        {/* Reflective highlight for glass effect */}
                        {!isActive && (
                            <div className="absolute top-0 left-0 right-0 h-px bg-white/40" />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
