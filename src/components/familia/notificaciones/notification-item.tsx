'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  MessageSquare,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Trash2,
  Archive,
  MoreVertical,
  ExternalLink,
  User,
  Star,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Bell,
  Settings,
  Eye,
  EyeOff,
  Reply,
  Forward,
  Mail
} from "lucide-react"
import { NotificacionFamilia, TipoNotificacion, CategoriaNotificacion } from '@/hooks/useNotificacionesFamilia'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

interface NotificationItemProps {
  notification: NotificacionFamilia
  onMarkAsRead: (id: number) => Promise<boolean>
  onArchive: (id: number) => Promise<boolean>
  onDelete: (id: number) => Promise<boolean>
  onReply?: (notification: NotificacionFamilia) => void
  className?: string
  showFull?: boolean
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onArchive,
  onDelete,
  onReply,
  className,
  showFull = false
}: NotificationItemProps) {
  const [expanded, setExpanded] = useState(showFull)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Handlers de acciones
  const handleMarkAsRead = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (notification.estado !== 'no_leida') return

    setActionLoading('markRead')
    const success = await onMarkAsRead(notification.id)
    if (!success) {
      // Mostrar error si es necesario
    }
    setActionLoading(null)
  }

  const handleArchive = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActionLoading('archive')
    const success = await onArchive(notification.id)
    if (!success) {
      // Mostrar error si es necesario
    }
    setActionLoading(null)
  }

  const handleDelete = async () => {
    setActionLoading('delete')
    const success = await onDelete(notification.id)
    if (!success) {
      // Mostrar error si es necesario
    }
    setActionLoading(null)
  }

  const handleCardClick = () => {
    if (!showFull) {
      setExpanded(!expanded)
      if (notification.estado === 'no_leida') {
        handleMarkAsRead()
      }
    }
  }

  // Funciones auxiliares para obtener iconos y colores
  const getTipoIcon = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'urgente': return <AlertTriangle className="h-5 w-5" />
      case 'importante': return <AlertCircle className="h-5 w-5" />
      case 'informativo': return <Info className="h-5 w-5" />
      case 'recordatorio': return <Calendar className="h-5 w-5" />
      case 'mensaje_scouter': return <Mail className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  const getTipoColor = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'urgente':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'importante':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'informativo':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'recordatorio':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'mensaje_scouter':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoriaIcon = (categoria?: CategoriaNotificacion) => {
    switch (categoria) {
      case 'documentos': return <FileText className="h-4 w-4" />
      case 'actividades': return <Calendar className="h-4 w-4" />
      case 'galeria': return <Star className="h-4 w-4" />
      case 'comunicados': return <Send className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return <Badge variant="destructive" className="text-xs">🔴 Alta</Badge>
      case 'normal':
        return <Badge variant="default" className="text-xs">🟡 Normal</Badge>
      case 'baja':
        return <Badge variant="secondary" className="text-xs">🟢 Baja</Badge>
      default:
        return null
    }
  }

  const getTipoLabel = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'urgente': return '🚨 Urgente'
      case 'importante': return '⚠️ Importante'
      case 'informativo': return 'ℹ️ Informativo'
      case 'recordatorio': return '📅 Recordatorio'
      case 'mensaje_scouter': return '✉️ Mensaje del Monitor'
      default: return tipo
    }
  }

  // Formateo de fechas
  const formatFecha = (fecha: string) => {
    try {
      const date = new Date(fecha)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true, locale: es })
      } else {
        return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
      }
    } catch {
      return fecha
    }
  }

  const isExpired = notification.fecha_expiracion && new Date(notification.fecha_expiracion) < new Date()

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer",
        notification.estado === 'no_leida' && "border-l-4 border-l-blue-500 bg-blue-50/30",
        notification.estado === 'archivada' && "opacity-60",
        isExpired && "border-orange-200 bg-orange-50/30",
        getTipoColor(notification.tipo),
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Contenido principal */}
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Icono del tipo */}
            <div className={cn(
              "p-2 rounded-lg border flex-shrink-0",
              getTipoColor(notification.tipo)
            )}>
              {getTipoIcon(notification.tipo)}
            </div>

            {/* Contenido de la notificación */}
            <div className="flex-1 min-w-0">
              {/* Encabezado */}
              <div className="flex items-center space-x-2 mb-2">
                <h3 className={cn(
                  "font-semibold truncate",
                  notification.estado === 'no_leida' && "text-blue-900"
                )}>
                  {notification.titulo}
                </h3>

                {/* Indicador de no leído */}
                {notification.estado === 'no_leida' && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}

                {/* Tipo de notificación */}
                <Badge variant="outline" className="text-xs">
                  {getTipoLabel(notification.tipo)}
                </Badge>

                {/* Prioridad */}
                {getPrioridadBadge(notification.prioridad)}

                {/* Categoría */}
                {notification.categoria && (
                  <Badge variant="outline" className="text-xs flex items-center space-x-1">
                    {getCategoriaIcon(notification.categoria)}
                    <span>{notification.categoria}</span>
                  </Badge>
                )}

                {/* Expiración */}
                {isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    ⏰ Expirada
                  </Badge>
                )}
              </div>

              {/* Remitente y scout */}
              <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-2">
                {notification.remitente_nombre && (
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>De: {notification.remitente_nombre}</span>
                    {notification.remitente_rol && (
                      <span className="text-gray-500">({notification.remitente_rol})</span>
                    )}
                  </div>
                )}

                {notification.scout_nombre && (
                  <div className="flex items-center space-x-1">
                    <span>👤</span>
                    <span>{notification.scout_nombre} {notification.scout_apellidos}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatFecha(notification.fecha_creacion)}</span>
                </div>
              </div>

              {/* Mensaje principal */}
              <p className={cn(
                "text-sm mb-3",
                notification.estado === 'no_leida' ? "text-gray-900" : "text-gray-600",
                !expanded && "line-clamp-2"
              )}>
                {notification.mensaje}
              </p>

              {/* Contenido expandido */}
              {(expanded || showFull) && (
                <div className="space-y-3">
                  {/* Metadatos adicionales */}
                  {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Información adicional:</h4>
                      <div className="space-y-1">
                        {Object.entries(notification.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs text-gray-600">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enlace de acción */}
                  {notification.enlace_accion && (
                    <div className="flex items-center space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={notification.enlace_accion}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver más
                        </a>
                      </Button>
                    </div>
                  )}

                  {/* Fechas adicionales */}
                  {(notification.fecha_lectura || notification.fecha_archivado) && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {notification.fecha_lectura && (
                        <div>✅ Leída: {formatFecha(notification.fecha_lectura)}</div>
                      )}
                      {notification.fecha_archivado && (
                        <div>📁 Archivada: {formatFecha(notification.fecha_archivado)}</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Botones de acción rápidos */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center space-x-2">
                  {notification.estado === 'no_leida' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleMarkAsRead(e)}
                      disabled={actionLoading === 'markRead'}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Marcar leída
                    </Button>
                  )}

                  {onReply && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onReply(notification)
                      }}
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Responder
                    </Button>
                  )}

                  {!showFull && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpanded(!expanded)
                      }}
                    >
                      {expanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Contraer
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Expandir
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Menú de acciones */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {notification.estado === 'no_leida' && (
                      <DropdownMenuItem onClick={(e) => handleMarkAsRead(e)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Marcar como leída
                      </DropdownMenuItem>
                    )}

                    {notification.estado !== 'archivada' && (
                      <DropdownMenuItem onClick={(e) => handleArchive(e)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archivar
                      </DropdownMenuItem>
                    )}

                    {notification.enlace_accion && (
                      <DropdownMenuItem asChild>
                        <a
                          href={notification.enlace_accion}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir enlace
                        </a>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar notificación?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente la notificación "{notification.titulo}".
                            No se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={actionLoading === 'delete'}
                          >
                            {actionLoading === 'delete' ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Eliminando...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente compacto para sidebar o listas reducidas
export function NotificationItemCompact({
  notification,
  onMarkAsRead,
  className
}: {
  notification: NotificacionFamilia
  onMarkAsRead: (id: number) => Promise<boolean>
  className?: string
}) {
  const [actionLoading, setActionLoading] = useState(false)

  const handleMarkAsRead = async () => {
    if (notification.estado !== 'no_leida') return

    setActionLoading(true)
    await onMarkAsRead(notification.id)
    setActionLoading(false)
  }

  const getTipoIcon = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'urgente': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'importante': return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'informativo': return <Info className="h-4 w-4 text-blue-500" />
      case 'recordatorio': return <Calendar className="h-4 w-4 text-green-500" />
      case 'mensaje_scouter': return <Mail className="h-4 w-4 text-purple-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div
      className={cn(
        "flex items-center space-x-3 p-3 rounded-lg border transition-colors hover:bg-gray-50",
        notification.estado === 'no_leida' && "bg-blue-50 border-blue-200",
        className
      )}
    >
      {getTipoIcon(notification.tipo)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="text-sm font-medium truncate">{notification.titulo}</h4>
          {notification.estado === 'no_leida' && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-600 truncate">{notification.mensaje}</p>
        <div className="text-xs text-gray-400 mt-1">
          {notification.scout_nombre} • {formatDistanceToNow(new Date(notification.fecha_creacion), { addSuffix: true, locale: es })}
        </div>
      </div>

      {notification.estado === 'no_leida' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleMarkAsRead}
          disabled={actionLoading}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}