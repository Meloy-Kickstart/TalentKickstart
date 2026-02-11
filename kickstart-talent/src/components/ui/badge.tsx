import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#500000]/30 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#500000] text-white hover:bg-[#732222]",
        secondary:
          "border-transparent bg-[#500000]/10 text-[#500000] hover:bg-[#500000]/20",
        destructive:
          "border-transparent bg-red-100 text-red-700",
        outline: "text-[#500000] border-[#500000]/20",
        glass:
          "border-white/50 bg-white/40 backdrop-blur-md text-[#500000] hover:bg-white/60",
        tech:
          "border-[#500000]/20 bg-[#500000]/5 text-[#500000] shadow-sm",
        success:
          "border-transparent bg-green-100 text-green-700",
        warning:
          "border-transparent bg-amber-200 text-amber-900",
        info:
          "border-transparent bg-blue-100 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
