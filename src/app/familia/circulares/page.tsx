'use client'

import { useCircularesFamiliar } from '@/hooks/useCircularDigital'
import { CircularResumenCard } from '@/components/familia/circular-digital/CircularResumenCard'
import { Loader2, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CircularesFamiliarPage() {
  const { circulares, isLoading, error } = useCircularesFamiliar()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Mis Circulares</h1>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {circulares.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground" data-testid="no-circulares">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No tienes circulares pendientes</p>
        </div>
      ) : (
        <div className="grid gap-4" data-testid="circulares-list">
          {circulares.map((c: any, i: number) => (
            <CircularResumenCard
              key={`${c.id}-${c.educando_id}-${i}`}
              circular={{
                id: c.id,
                titulo: c.titulo,
                actividad_titulo: c.actividad_titulo,
                actividad_fecha: c.actividad_fecha,
                actividad_lugar: c.actividad_lugar,
                fecha_limite_firma: c.fecha_limite_firma,
                circular_estado: c.circular_estado
              }}
              educando={{
                educando_nombre: c.educando_nombre,
                educando_apellidos: c.educando_apellidos,
                seccion_nombre: c.seccion_nombre
              }}
              respuestaEstado={c.respuesta_estado}
              fechaFirma={c.fecha_firma}
              onClick={() => router.push(`/familia/circulares/${c.actividad_id || c.id}?educandoId=${c.educando_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
