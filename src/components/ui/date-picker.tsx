"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  disabled = false,
  className
}: DatePickerProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    if (dateValue) {
      onChange?.(new Date(dateValue))
    } else {
      onChange?.(undefined)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <input
          type="date"
          value={value ? formatDate(value) : ""}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground"
          )}
        />
      </div>
    </div>
  )
}
