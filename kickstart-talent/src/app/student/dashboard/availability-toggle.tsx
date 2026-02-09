"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toggleAvailability } from "@/lib/actions/student"

interface AvailabilityToggleProps {
  isAvailable: boolean
}

export function AvailabilityToggle({ isAvailable: initialValue }: AvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    setIsAvailable(!isAvailable)
    
    const result = await toggleAvailability()
    
    if (result?.error) {
      // Revert on error
      setIsAvailable(isAvailable)
    }
    
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-edge bg-card">
      <Switch
        id="availability"
        checked={isAvailable}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      <Label htmlFor="availability" className="text-sm font-medium cursor-pointer">
        {isAvailable ? (
          <span className="text-green-400">Open to opportunities</span>
        ) : (
          <span className="text-muted">Not looking</span>
        )}
      </Label>
    </div>
  )
}
