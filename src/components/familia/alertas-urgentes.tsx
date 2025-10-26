'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  AlertTriangle,
  FileText,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  X,
  ChevronRight,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AlertaUrgente {
  id: number
  tipo: 'documento' | 'actividad' | 'mensaje' | 'pago' | 'medico'
  titulo: string
  descripcion: string
  prioridad: 'alta' | 'media' | 'baja'
  fecha_creacion: string
  fecha_limite?: string
  leido: boolean
  accion?: {
    texto: string
    href: string
    metodo?: 'get' | 'post'
  }
  scout_nombre?: string
  seccion?: string
}

interface AlertasUrgentesProps {
  alertas?: AlertaUrgente[]
  maxAlertas?: number
  onDismiss?: (alertaId: number) => void
  onMarkAsRead?: (alertaId: number) => void
  onRefresh?: () => void
  refreshing?: boolean
  className?: string
  showAllLink?: boolean
}

export function AlertasUrgentes({
  alertas = [],
  maxAlertas = 3,
  onDismiss,
  onMarkAsRead,
  onRefresh,
  refreshing = false,
  className,
  showAllLink = true
}: AlertasUrgentesProps) {
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null)

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'documento': return <FileText className="h-4 w-4" />
      case 'actividad': return <Calendar className="h-4 w-4" />
      case 'mensaje': return <MessageSquare className="h-4 w-4" />
      case 'pago': return <Clock className="h-4 w-4" />
      case 'medico': return <AlertTriangle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'documento': return 'text-blue-600 bg-blue-50'
      case 'actividad': return 'text-green-600 bg-green-50'
      case 'mensaje': return 'text-purple-600 bg-purple-50'
      case 'pago': return 'text-orange-600 bg-orange-50'
      case 'medico': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPrioridadVariant = (prioridad: string): "default" | "destructive" => {
    switch (prioridad) {
      case 'alta': return 'destructive'
      case 'media': return 'default'
      case 'baja': return 'default'
      default: return 'default'
    }
  }

  const getPrioridadLabel = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'Urgente'
      case 'media': return 'Importante'
      case 'baja': return 'Informativo'
      default: return 'Normal'
    }
  }

  const handleAlertClick = (alertaId: number) => {
    if (expandedAlert === alertaId) {
      setExpandedAlert(null)
    } else {
      setExpandedAlert(alertaId)
      if (!alertas.find(a => a.id === alertaId)?.leido) {
        onMarkAsRead?.(alertaId)
      }
    }
  }

  const handleDismiss = (e: React.MouseEvent, alertaId: number) => {
    e.stopPropagation()
    onDismiss?.(alertaId)
  }

  const handleAction = (e: React.MouseEvent, alerta: AlertaUrgente) => {
    e.stopPropagation()
    if (alerta.accion) {
      onMarkAsRead?.(alerta.id)
    }
  }

  const alertasFiltradas = alertas.slice(0, maxAlertas)
  const noLeidasCount = alertas.filter(a => !a.leido).length

  if (alertas.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Todo en Orden</span>
            </span>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <p className="font-medium">No hay alertas importantes</p>
            <p className="text-sm">Todos los documentos y actividades están al día</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span>Alertas Importantes</span>
          {noLeidasCount > 0 && (
            <Badge variant="destructive">{noLeidasCount}</Badge>
          )}
        </h2>
        
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {alertasFiltradas.map((alerta) => (
          <Alert
            key={alerta.id}
            variant={getPrioridadVariant(alerta.prioridad)}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              !alerta.leido && "border-l-4 border-l-red-500",
              expandedAlert === alerta.id && "ring-2 ring-ring"
            )}
            onClick={() => handleAlertClick(alerta.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  getTipoColor(alerta.tipo)
                )}>
                  {getTipoIcon(alerta.tipo)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertTitle className="text-sm font-semibold truncate">
                      {alerta.titulo}
                    </AlertTitle>
                    <Badge variant={getPrioridadVariant(alerta.prioridad)}>
                      {getPrioridadLabel(alerta.prioridad)}
                    </Badge>
                    {!alerta.leido && (
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  
                  <AlertDescription className="text-sm line-clamp-2">
                    {alerta.descripcion}
                  </AlertDescription>

                  {(alerta.scout_nombre || alerta.seccion || alerta.fecha_limite) && (
                    <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                      {alerta.scout_nombre && (
                        <span>👤 {alerta.scout_nombre}</span>
                      )}
                      {alerta.seccion && (
                        <span>🏕️ {alerta.seccion}</span>
                      )}
                      {alerta.fecha_limite && (
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(alerta.fecha_limite).toLocaleDateString('es-ES')}
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  {expandedAlert === alerta.id && alerta.accion && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          ¿Deseas {alerta.accion.texto.toLowerCase()}?
                        </p>
                        <div className="flex space-x-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={alerta.accion!.href} onClick={(e) => handleAction(e, alerta)}>
                              {alerta.accion!.texto}
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setExpandedAlert(null)}>
                            Ahora no
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 flex-shrink-0"
                  onClick={(e) => handleDismiss(e, alerta.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Alert>
        ))}
      </div>

      {showAllLink && alertas.length > maxAlertas && (
        <div className="mt-4 text-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/familia/notificaciones">
              Ver todas las alertas ({alertas.length - maxAlertas} más)
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}

      <Separator className="my-4" />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {alertas.filter(a => !a.leido).length} de {alertas.length} alertas sin leer
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            alertas.filter(a => !a.leido).forEach(a => onMarkAsRead?.(a.id))
          }}
        >
          Marcar todas como leídas
        </Button>
      </div>
    </div>
  )
}

// Componente simplificado para el dashboard
export function AlertasUrgentesCompact({ 
  alertas = [], 
  maxAlertas = 2 
}: { 
  alertas?: AlertaUrgente[]
  maxAlertas?: number 
}) {
  const alertasUrgentes = alertas
    .filter(a => a.prioridad === 'alta' && !a.leido)
    .slice(0, maxAlertas)

  if (alertasUrgentes.length === 0) return null

  return (
    <div className="space-y-2">
      {alertasUrgentes.map((alerta) => (
        <Alert key={alerta.id} variant="destructive" className="animate-pulse">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm">{alerta.titulo}</AlertTitle>
          <AlertDescription className="text-xs">
            {alerta.descripcion}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}