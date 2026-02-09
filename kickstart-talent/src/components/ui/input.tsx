import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[#500000]/10 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-[#1a0a0d] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#500000]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#500000]/30 focus-visible:border-[#500000]/20 focus-visible:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
