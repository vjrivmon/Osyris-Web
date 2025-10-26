'use client'

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickActionIconProps {
  icon: LucideIcon
  label: string
  href: string
  badge?: number
  color?: string
  className?: string
}

export function QuickActionIcon({
  icon: Icon,
  label,
  href,
  badge,
  color = "text-gray-600",
  className
}: QuickActionIconProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative hover:bg-accent", className)}
            asChild
          >
            <Link href={href} aria-label={label}>
              <Icon className={cn("h-5 w-5", color)} />
              {badge !== undefined && badge > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {badge > 9 ? '9+' : badge}
                </Badge>
              )}
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Componente para grupo de iconos de acción rápida - con texto visible
 */
export function QuickActionsGroup({
  actions,
  className
}: {
  actions: Array<{
    icon: LucideIcon
    label: string
    href: string
    badge?: number
    color?: string
  }>
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          asChild
          className="relative"
        >
          <Link href={action.href}>
            <action.icon className={cn("h-4 w-4 mr-2", action.color)} />
            <span>{action.label}</span>
            {action.badge !== undefined && action.badge > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 min-w-[20px] rounded-full p-0 px-1.5 flex items-center justify-center text-xs"
              >
                {action.badge > 9 ? '9+' : action.badge}
              </Badge>
            )}
          </Link>
        </Button>
      ))}
    </div>
  )
}

/**
 * Variante con texto para desktop
 */
export function QuickActionButton({
  icon: Icon,
  label,
  href,
  badge,
  color = "text-gray-600",
  className
}: QuickActionIconProps) {
  return (
    <Button
      variant="outline"
      className={cn("relative", className)}
      asChild
    >
      <Link href={href}>
        <Icon className={cn("h-4 w-4 mr-2", color)} />
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
          <Badge
            variant="destructive"
            className="ml-2 h-5 min-w-[20px] rounded-full p-0 px-1.5 flex items-center justify-center text-xs"
          >
            {badge > 9 ? '9+' : badge}
          </Badge>
        )}
      </Link>
    </Button>
  )
}
