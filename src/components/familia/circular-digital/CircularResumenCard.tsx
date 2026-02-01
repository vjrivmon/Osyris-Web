'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface CircularResumenCardProps {
  circular: {
    id: number
    titulo: string
    actividad_titulo?: string
    actividad_fecha?: string
    actividad_lugar?: string
    fecha_limite_firma?: string | null
    circular_estado?: string
  }
  educando: {
    educando_nombre: string
    educando_apellidos: string
    seccion_nombre: string
  }
  respuestaEstado: string | null
  fechaFirma?: string | null
  onClick?: () => void
}

export function CircularResumenCard({ circular, educando, respuestaEstado, fechaFirma, onClick }: CircularResumenCardProps) {
  const isFirmada = respuestaEstado && !['pendiente'].includes(respuestaEstado)
  const isError = respuestaEstado?.startsWith('error')

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isFirmada ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' : isError ? 'border-red-300 bg-red-50/50' : 'border-amber-200'
      }`}
      onClick={onClick}
      data-testid="circular-card"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {circular.titulo || circular.actividad_titulo}
          </CardTitle>
          <Badge variant={isFirmada ? 'default' : isError ? 'destructive' : 'secondary'} data-testid="circular-estado">
            {isFirmada ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" />Firmada</>
            ) : isError ? (
              <><AlertCircle className="h-3 w-3 mr-1" />Error</>
            ) : (
              <><Clock className="h-3 w-3 mr-1" />Pendiente</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium">{educando.educando_nombre} {educando.educando_apellidos} — {educando.seccion_nombre}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {circular.actividad_fecha && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(circular.actividad_fecha).toLocaleDateString('es-ES')}
            </span>
          )}
          {circular.actividad_lugar && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {circular.actividad_lugar}
            </span>
          )}
        </div>
        {circular.fecha_limite_firma && (
          <p className="text-xs text-amber-600">
            Fecha límite: {new Date(circular.fecha_limite_firma).toLocaleDateString('es-ES')}
          </p>
        )}
        {fechaFirma && (
          <p className="text-xs text-green-600">
            Firmada el {new Date(fechaFirma).toLocaleDateString('es-ES')}
          </p>
        )}
        {!isFirmada && (
          <Button variant="default" size="sm" className="w-full mt-2">
            Firmar circular
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
