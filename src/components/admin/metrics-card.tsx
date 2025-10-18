"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
  }
  className?: string
}

export function MetricsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className
}: MetricsCardProps) {
  const getTrendColor = () => {
    switch (trend?.direction) {
      case "up":
        return "text-green-600 dark:text-green-400"
      case "down":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case "up":
        return "↑"
      case "down":
        return "↓"
      default:
        return "→"
    }
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center justify-between mt-2">
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            {trend && (
              <div className={cn("flex items-center text-xs font-medium", getTrendColor())}>
                <span className="mr-1">{getTrendIcon()}</span>
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}