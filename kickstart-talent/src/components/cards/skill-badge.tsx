import { cn } from "@/lib/utils"

interface SkillBadgeProps {
  name: string
  className?: string
  removable?: boolean
  onRemove?: () => void
}

export function SkillBadge({ name, className, removable, onRemove }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-card-hover px-3 py-1 text-sm font-medium text-muted-foreground",
        className
      )}
    >
      {name}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:text-foreground"
        >
          ×
        </button>
      )}
    </span>
  )
}
