'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useFamiliaData } from '@/hooks/useFamiliaData'
import { getApiUrl } from '@/lib/api-utils'
import { InscripcionCampamentoWizard } from '@/components/familia/calendario/inscripcion-campamento-wizard'
import { Loader2 } from 'lucide-react'
import type { ActividadCampamento } from '@/types/familia'

export default function InscripcionCampamentoPage() {
  const params = useParams()
  const router = useRouter()
  const actividadId = params?.id as string
  const { user, authReady } = useAuth()
  const { hijos } = useFamiliaData()

  const [actividad, setActividad] = useState<ActividadCampamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Datos del familiar para prellenar
  const familiarData = useMemo(() => ({
    nombre: user ? `${user.nombre} ${user.apellidos || ''}`.trim() : '',
    email: user?.email || '',
    telefono: (user as any)?.telefono || ''
  }), [user])

  // Redirect si no está logueado
  useEffect(() => {
    if (authReady && !user) {
      router.push(`/login?redirect=/familia/campamento/${actividadId}/inscripcion`)
    }
  }, [authReady, user, actividadId, router])

  // Cargar datos de la actividad
  useEffect(() => {
    if (!actividadId || !user) return

    const fetchActividad = async () => {
      try {
        const token = localStorage.getItem('token')
        const apiUrl = getApiUrl()

        const res = await fetch(`${apiUrl}/api/actividades/${actividadId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!res.ok) {
          setError('No se pudo cargar la actividad')
          setLoading(false)
          return
        }

        const data = await res.json()
        const act = data.data || data

        setActividad({
          id: act.id,
          titulo: act.titulo,
          descripcion: act.descripcion || '',
          fecha: act.fecha_inicio?.split('T')[0] || act.fecha_inicio,
          fechaFin: act.fecha_fin?.split('T')[0] || act.fecha_fin,
          lugar: act.lugar,
          costo: act.precio,
          scoutIds: [],
          confirmaciones: {},
          campamento: {
            lugar_salida: act.lugar_salida,
            hora_salida: act.hora_salida,
            mapa_salida_url: act.mapa_salida_url,
            lugar_regreso: act.lugar_regreso,
            hora_regreso: act.hora_regreso,
            numero_cuenta: act.numero_cuenta,
            concepto_pago: act.concepto_pago,
            recordatorios_predefinidos: act.recordatorios_predefinidos,
            recordatorios_personalizados: act.recordatorios_personalizados,
            circular_drive_id: act.circular_drive_id,
            circular_drive_url: act.circular_drive_url,
            circular_nombre: act.circular_nombre
          }
        })
      } catch (err) {
        setError('Error al cargar la actividad')
      } finally {
        setLoading(false)
      }
    }

    fetchActividad()
  }, [actividadId, user])

  if (!authReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Cargando inscripción...</span>
      </div>
    )
  }

  if (error || !actividad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-red-600 text-lg">{error || 'Actividad no encontrada'}</p>
        <button
          onClick={() => router.push('/familia/dashboard')}
          className="text-primary underline"
        >
          Volver al dashboard
        </button>
      </div>
    )
  }

  // Usar primer hijo como educando por defecto
  const educando = hijos?.[0]

  if (!educando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-muted-foreground">No se encontró un educando asociado a tu cuenta.</p>
        <button
          onClick={() => router.push('/familia/dashboard')}
          className="text-primary underline"
        >
          Volver al dashboard
        </button>
      </div>
    )
  }

  return (
    <InscripcionCampamentoWizard
      isOpen={true}
      onClose={() => router.push('/familia/dashboard')}
      actividad={actividad}
      educando={educando}
      familiarData={familiarData}
    />
  )
}
