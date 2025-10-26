'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  LucideIcon, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  Plus,
  Upload,
  Calendar,
  Camera,
  FileText,
  Users,
  MessageSquare,
  Phone,
  Settings,
  HelpCircle,
  Star,
  Download,
  Bell,
  Edit,
  ExternalLink
} from "lucide-react"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: LucideIcon
  href?: string
  onClick?: () => void | Promise<void>
  badge?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  disabled?: boolean
  loading?: boolean
  success?: boolean
  external?: boolean
}

interface QuickActionButtonProps {
  action: QuickAction
  size?: 'sm' | 'default' | 'lg' | 'xl'
  variant?: 'button' | 'card'
  showDescription?: boolean
  className?: string
  onClick?: () => Promise<void>
}

export function QuickActionButton({
  action,
  size = 'default',
  variant = 'button',
  showDescription = true,
  className,
  onClick
}: QuickActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const getColorClasses = (color: string, isHovered: boolean = false) => {
    const baseClasses = {
      primary: {
        bg: 'bg-green-600 hover:bg-green-700',
        text: 'text-white',
        border: 'border-green-600',
        light: 'bg-green-50 hover:bg-green-100',
        lightText: 'text-green-700'
      },
      success: {
        bg: 'bg-blue-600 hover:bg-blue-700',
        text: 'text-white',
        border: 'border-blue-600',
        light: 'bg-blue-50 hover:bg-blue-100',
        lightText: 'text-blue-700'
      },
      warning: {
        bg: 'bg-yellow-600 hover:bg-yellow-700',
        text: 'text-white',
        border: 'border-yellow-600',
        light: 'bg-yellow-50 hover:bg-yellow-100',
        lightText: 'text-yellow-700'
      },
      error: {
        bg: 'bg-red-600 hover:bg-red-700',
        text: 'text-white',
        border: 'border-red-600',
        light: 'bg-red-50 hover:bg-red-100',
        lightText: 'text-red-700'
      },
      info: {
        bg: 'bg-purple-600 hover:bg-purple-700',
        text: 'text-white',
        border: 'border-purple-600',
        light: 'bg-purple-50 hover:bg-purple-100',
        lightText: 'text-purple-700'
      }
    }

    const colorScheme = baseClasses[color as keyof typeof baseClasses] || baseClasses.primary
    
    return colorScheme
  }

  const getSizeClasses = (size: string) => {
    const sizes = {
      sm: 'h-12 px-4 text-sm',
      default: 'h-16 px-6 text-base',
      lg: 'h-20 px-8 text-lg',
      xl: 'h-24 px-10 text-xl'
    }
    return sizes[size as keyof typeof sizes] || sizes.default
  }

  const handleActionClick = async () => {
    if (action.disabled || isLoading || isSuccess) return

    setIsLoading(true)
    setIsSuccess(false)

    try {
      if (onClick) {
        await onClick()
      } else if (action.onClick) {
        await action.onClick()
      }
      
      // Simular éxito si no hay error
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 2000)
    } catch (error) {
      console.error('Error executing action:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const IconComponent = isLoading ? Loader2 : isSuccess ? CheckCircle : action.icon
  const colorScheme = getColorClasses(action.color || 'primary')

  if (variant === 'card') {
    return (
      <Card className={cn(
        "group hover:shadow-lg transition-all cursor-pointer border-2",
        action.disabled && "opacity-50 cursor-not-allowed",
        isSuccess && "border-green-500 bg-green-50",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className={cn(
              "p-3 rounded-lg transition-colors",
              colorScheme.light
            )}>
              <IconComponent className={cn(
                "h-8 w-8",
                isLoading && "animate-spin",
                colorScheme.lightText
              )} />
            </div>
            
            <div className="flex items-center space-x-2">
              {action.badge && (
                <Badge variant={action.badge === 'NEW' ? 'destructive' : 'secondary'}>
                  {action.badge}
                </Badge>
              )}
              
              {action.external && (
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              )}
              
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </div>
          
          <CardTitle className="text-lg">{action.title}</CardTitle>
          {showDescription && (
            <CardDescription className="text-sm">
              {action.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <Button
            onClick={handleActionClick}
            disabled={action.disabled || isLoading}
            className={cn("w-full", colorScheme.bg)}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completado
              </>
            ) : (
              <>
                {action.title}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Button
      onClick={handleActionClick}
      disabled={action.disabled || isLoading}
      className={cn(
        "relative overflow-hidden group transition-all duration-200",
        getSizeClasses(size),
        colorScheme.bg,
        colorScheme.text,
        "min-w-[60px]",
        isSuccess && "bg-green-600 hover:bg-green-700",
        action.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      variant={action.variant}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <IconComponent className={cn(
            "h-6 w-6",
            size === 'lg' && "h-8 w-8",
            size === 'xl' && "h-10 w-10",
            isLoading && "animate-spin"
          )} />
        </div>
        
        <div className="flex-1 text-left min-w-0">
          <div className="font-semibold truncate">{action.title}</div>
          {showDescription && size !== 'sm' && (
            <div className="text-sm opacity-90 truncate">
              {action.description}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {action.badge && (
            <Badge variant="secondary" className="text-xs">
              {action.badge}
            </Badge>
          )}
          
          {action.external && (
            <ExternalLink className="h-4 w-4 opacity-70" />
          )}
          
          {!isLoading && !isSuccess && (
            <ArrowRight className="h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
          )}
        </div>
      </div>
      
      {/* Overlay de carga/éxito */}
      {(isLoading || isSuccess) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          {isLoading && (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          )}
          {isSuccess && (
            <CheckCircle className="h-8 w-8 text-white" />
          )}
        </div>
      )}
    </Button>
  )
}

// Componente para grid de acciones rápidas
export function QuickActionGrid({
  actions,
  columns = 3,
  size = 'default',
  variant = 'card',
  showDescriptions = true,
  className
}: {
  actions: QuickAction[]
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  size?: 'sm' | 'default' | 'lg' | 'xl'
  variant?: 'button' | 'card'
  showDescriptions?: boolean
  className?: string
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  return (
    <div className={cn(
      "grid gap-4",
      gridCols[columns],
      className
    )}>
      {actions.map((action) => (
        <QuickActionButton
          key={action.id}
          action={action}
          size={size}
          variant={variant}
          showDescription={showDescriptions}
        />
      ))}
    </div>
  )
}

// Acciones predefinidas comunes
export const COMMON_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'calendar',
    title: 'Calendario',
    description: 'Ver actividades programadas',
    icon: Calendar,
    href: '/familia/calendario',
    color: 'primary',
    badge: '3 eventos'
  },
  {
    id: 'documents',
    title: 'Subir Documento',
    description: 'Documentación importante',
    icon: Upload,
    href: '/familia/documentos',
    color: 'success'
  },
  {
    id: 'gallery',
    title: 'Galería',
    description: 'Fotos de actividades',
    icon: Camera,
    href: '/familia/galeria',
    color: 'info'
  },
  {
    id: 'confirm',
    title: 'Confirmar Asistencias',
    description: 'Responde a invitaciones',
    icon: CheckCircle,
    href: '/familia/calendario',
    color: 'warning',
    badge: '2 pendientes'
  },
  {
    id: 'contact',
    title: 'Contactar Monitor',
    description: 'Habla con los monitores',
    icon: MessageSquare,
    href: '/familia/notificaciones',
    color: 'error'
  },
  {
    id: 'profile',
    title: 'Mi Perfil',
    description: 'Actualiza tus datos',
    icon: Settings,
    href: '/familia/perfil',
    color: 'info'
  }
]

// Hook personalizado para acciones dinámicas
export function useQuickActions(customActions?: QuickAction[]) {
  const [actions, setActions] = useState<QuickAction[]>(
    customActions || COMMON_QUICK_ACTIONS
  )

  const updateAction = (id: string, updates: Partial<QuickAction>) => {
    setActions(prev => 
      prev.map(action => 
        action.id === id ? { ...action, ...updates } : action
      )
    )
  }

  const addAction = (action: QuickAction) => {
    setActions(prev => [...prev, action])
  }

  const removeAction = (id: string) => {
    setActions(prev => prev.filter(action => action.id !== id))
  }

  const updateBadge = (id: string, badge?: string) => {
    updateAction(id, { badge })
  }

  const setActionLoading = (id: string, loading: boolean) => {
    updateAction(id, { loading })
  }

  const setActionSuccess = (id: string, success: boolean) => {
    updateAction(id, { success })
  }

  return {
    actions,
    updateAction,
    addAction,
    removeAction,
    updateBadge,
    setActionLoading,
    setActionSuccess
  }
}