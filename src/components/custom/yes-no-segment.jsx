"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

export function YesNoSegment({ value, onChange, name, disabled, className, size = "md" }) {
  const sizes = {
    sm: "h-8 text-xs",
    md: "h-9 text-sm",
    lg: "h-10 text-sm",
  }

  const handleKey = (e) => {
    if (disabled) return
    if (e.key === "ArrowLeft") onChange(false, name)
    if (e.key === "ArrowRight") onChange(true, name)
  }

  return (
    <div
      role="radiogroup"
      aria-label={`${name} selection`}
      tabIndex={0}
      onKeyDown={handleKey}
      className={cn(
        "inline-flex rounded-full bg-muted p-1",
        "border border-[#0077B6]/20 focus:outline-none focus:ring-2 focus:ring-[#0077B6]",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      )}
    >
      <Button
        type="button"
        role="radio"
        aria-checked={value === false}
        disabled={disabled}
        onClick={() => onChange(false, name)}
        className={cn(
          "rounded-full",
          sizes[size],
          "px-3",
          value ? "bg-transparent text-foreground" : "bg-[#0077B6] text-white",
          disabled ? "hover:bg-transparent cursor-not-allowed" : "hover:bg-[#0077B6]/96 hover:text-white cursor-pointer",
          "aria-checked:bg-[#0077B6] aria-checked:text-white",
        )}
        variant="ghost"
      >
        <X className="mr-1 h-4 w-4" />
        No
      </Button>
      <Button
        type="button"
        role="radio"
        aria-checked={value === true}
        disabled={disabled}
        onClick={() => onChange(true, name)}
        className={cn(
          "rounded-full",
          sizes[size],
          "px-3",
          value ? "bg-[#0077B6] text-white " : "bg-transparent text-foreground",
          disabled ? "hover:bg-transparent hover:text-inherit cursor-not-allowed" : "hover:bg-[#0077B6]/96 hover:text-white cursor-pointer",
          "aria-checked:bg-[#0077B6] aria-checked:text-white ml-1",
        )}
        variant="ghost"
      >
        <Check className="mr-1 h-4 w-4" />
        Yes
      </Button>
    </div>
  )
}
