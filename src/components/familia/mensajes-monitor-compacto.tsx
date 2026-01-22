'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, ArrowRight, Clock, User, ChevronRight } from 'lucide-react'
import { useNotificacionesFamilia, NotificacionFamilia } from '@/hooks/useNotificacionesFamilia'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface MensajesMonitorCompactoProps {
  maxMensajes?: number
  className?: string
}

export function MensajesMonitorCompacto({
  maxMensajes = 3,
  className
}: MensajesMonitorCompactoProps) {
  const { notificaciones, loading, marcarComoLeida } = useNotificacionesFamilia()

  // Filtrar solo mensajes de scouters
  const mensajesScouter = useMemo(() => {
    return notificaciones
      .filter(n => n.tipo === 'mensaje_scouter')
      .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
      .slice(0, maxMensajes)
  }, [notificaciones, maxMensajes])

  const mensajesNoLeidos = useMemo(() => {
    return notificaciones.filter(n => n.tipo === 'mensaje_scouter' && n.estado === 'no_leida').length
  }, [notificaciones])

  // Formatear fecha relativa
  const formatFechaRelativa = (fecha: string): string => {
    const ahora = new Date()
    const fechaMsg = new Date(fecha)
    const diffMs = ahora.getTime() - fechaMsg.getTime()
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHoras < 1) return 'Hace un momento'
    if (diffHoras < 24) return `Hace ${diffHoras}h`
    if (diffDias === 1) return 'Ayer'
    if (diffDias < 7) return `Hace ${diffDias} dias`
    return fechaMsg.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  // Si no hay mensajes, no mostrar nada
  if (!loading && mensajesScouter.length === 0) {
    return null
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600" />
            Mensajes del Monitor
            {mensajesNoLeidos > 0 && (
              <Badge variant="destructive" className="ml-1">
                {mensajesNoLeidos} nuevo{mensajesNoLeidos > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/familia/notificaciones?tipo=mensaje_scouter">
              Ver todos
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {mensajesScouter.map((mensaje) => (
              <MensajeItem
                key={mensaje.id}
                mensaje={mensaje}
                onMarcarLeido={() => marcarComoLeida(mensaje.id)}
              />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}

interface MensajeItemProps {
  mensaje: NotificacionFamilia
  onMarcarLeido: () => void
}

function MensajeItem({ mensaje, onMarcarLeido }: MensajeItemProps) {
  const esNoLeido = mensaje.estado === 'no_leida'
  const remitenteNombre = mensaje.metadata?.remitente_nombre || 'Monitor'

  // Formatear fecha
  const fechaRelativa = useMemo(() => {
    const ahora = new Date()
    const fechaMsg = new Date(mensaje.fecha_creacion)
    const diffMs = ahora.getTime() - fechaMsg.getTime()
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHoras < 1) return 'Hace un momento'
    if (diffHoras < 24) return `Hace ${diffHoras}h`
    if (diffDias === 1) return 'Ayer'
    if (diffDias < 7) return `Hace ${diffDias} dias`
    return fechaMsg.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }, [mensaje.fecha_creacion])

  const handleClick = () => {
    if (esNoLeido) {
      onMarcarLeido()
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-colors",
        esNoLeido
          ? "bg-purple-50 border-purple-200 hover:bg-purple-100"
          : "bg-muted/30 border-transparent hover:bg-muted/50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {esNoLeido && (
              <span className="h-2 w-2 rounded-full bg-purple-600 shrink-0" />
            )}
            <span className="font-medium text-sm truncate">{mensaje.titulo}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {mensaje.mensaje}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {remitenteNombre}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {fechaRelativa}
            </span>
            {mensaje.scout_nombre && (
              <span className="text-purple-600">
                {mensaje.scout_nombre}
              </span>
            )}
          </div>
        </div>
        {mensaje.prioridad === 'alta' && (
          <Badge variant="destructive" className="shrink-0">
            Urgente
          </Badge>
        )}
      </div>
    </div>
  )
}
