import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#500000]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#500000] to-[#732222] text-white hover:from-[#3d0000] hover:to-[#500000] shadow-md shadow-[#500000]/20 border border-white/20",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600",
        outline:
          "border border-[#500000]/20 bg-transparent shadow-sm hover:bg-[#500000]/5 hover:text-[#500000] hover:border-[#500000]/30 text-[#500000]",
        secondary:
          "bg-[#500000]/10 text-[#500000] shadow-sm hover:bg-[#500000]/20",
        ghost: "hover:bg-[#500000]/5 hover:text-[#500000] text-[#500000]/70",
        link: "text-[#500000] underline-offset-4 hover:underline",
        glass:
          "glass text-[#500000] hover:bg-white/60",
        liquid:
          "bg-gradient-to-r from-[#500000] to-[#a50034] text-white hover:opacity-90 shadow-lg shadow-[#500000]/25 border border-white/20",
        tech:
          "bg-white/50 backdrop-blur-md border border-[#500000]/20 text-[#500000] hover:bg-white/70 hover:border-[#500000]/30 shadow-md",
        orange:
          "bg-[#d4a574] text-white hover:bg-[#c49564] shadow-md",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
