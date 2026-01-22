'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getApiUrl } from '@/lib/api-utils'
import { useFamiliaData } from './useFamiliaData'

import type { CampamentoDetalles } from '@/types/familia'

export interface ActividadCalendario {
  id: string
  titulo: string
  descripcion: string
  fechaInicio: Date
  fechaFin: Date
  lugar: string
  seccion: string
  seccion_id: number
  scoutIds: string[] // IDs de los hijos del familiar que participan
  monitorResponsable: {
    nombre: string
    foto: string
    contacto: string
  }
  precio?: number
  cupoMaximo?: number
  materialNecesario: string[]
  confirmaciones: {
    [scoutId: string]: 'confirmado' | 'pendiente' | 'no_asiste'
  }
  tipo: 'reunion_sabado' | 'reunion' | 'campamento' | 'salida' | 'excursion' | 'evento_especial' | 'evento' | 'actividad' | 'jornada' | 'festivo' | 'asamblea' | 'consejo_grupo' | 'reunion_kraal' | 'formacion' | 'otro'
  coordenadas?: {
    lat: number
    lng: number
  }
  // Detalles adicionales para campamentos
  campamento?: CampamentoDetalles
}

export interface ConfirmacionAsistencia {
  id: string
  actividadId: string
  scoutId: string
  estado: 'confirmado' | 'pendiente' | 'no_asiste'
  comentario?: string
  fechaConfirmacion: Date
}

interface UseCalendarioFamiliaOptions {
  autoRefetch?: boolean
  refetchInterval?: number
  cacheKey?: string
}

interface UseCalendarioFamiliaReturn {
  actividades: ActividadCalendario[]
  loading: boolean
  error: string | null
  confirmaciones: ConfirmacionAsistencia[]

  // Funciones
  refetch: () => Promise<void>
  confirmarAsistencia: (actividadId: string, scoutId: string, estado: 'confirmado' | 'no_asiste', comentario?: string) => Promise<boolean>
  modificarConfirmacion: (confirmacionId: string, estado: 'confirmado' | 'no_asiste', comentario?: string) => Promise<boolean>

  // Filtros y utilidades
  actividadesPorMes: (year: number, month: number) => ActividadCalendario[]
  actividadesPorSeccion: (seccionId: number) => ActividadCalendario[]
  actividadesPorScout: (scoutId: string) => ActividadCalendario[]
  proximasActividades: (dias?: number) => ActividadCalendario[]
  actividadesPendientesConfirmacion: () => ActividadCalendario[]
  generarICS: (actividad: ActividadCalendario) => string
}

export function useCalendarioFamilia({
  autoRefetch = true,
  refetchInterval = 5 * 60 * 1000, // 5 minutos
  cacheKey = 'calendario-familia-data'
}: UseCalendarioFamiliaOptions = {}): UseCalendarioFamiliaReturn {
  const { user, token, isAuthenticated } = useAuth()
  const { hijos, seccionesHijos } = useFamiliaData()
  const [actividades, setActividades] = useState<ActividadCalendario[]>([])
  const [confirmaciones, setConfirmaciones] = useState<ConfirmacionAsistencia[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Colores por sección scout
  const coloresSeccion = {
    'Colonia La Veleta': '#FF6B35', // Naranja
    'Manada Waingunga': '#FFD93D', // Amarillo
    'Tropa Brownsea': '#6BCF7F', // Verde
    'Posta Kanhiwara': '#E74C3C', // Rojo
    'Ruta Walhalla': '#2E7D32' // Verde botella
  }

  // Cargar confirmaciones existentes del familiar
  const fetchConfirmaciones = useCallback(async (): Promise<ConfirmacionAsistencia[]> => {
    if (!isAuthenticated || !token || !user) {
      return []
    }

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/confirmaciones/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Transformar al formato del frontend
        // Usar el campo 'estado' del backend si existe, sino derivar de 'asistira'
        return (data.data || []).map((conf: any) => ({
          id: conf.id?.toString(),
          actividadId: conf.actividad_id?.toString(),
          scoutId: conf.educando_id?.toString(),
          estado: conf.estado || (conf.asistira ? 'confirmado' : 'no_asiste'),
          comentario: conf.comentarios,
          fechaConfirmacion: conf.confirmado_en ? new Date(conf.confirmado_en) : new Date()
        }))
      }
      return []
    } catch (err) {
      console.error('Error cargando confirmaciones:', err)
      return []
    }
  }, [isAuthenticated, token, user])

  const fetchActividades = useCallback(async () => {
    if (!isAuthenticated || !token || !user) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Obtener IDs de los hijos
      const hijosIds = hijos?.map(h => h.id.toString()) || []

      // Obtener actividades desde API - usar endpoint de actividades por mes
      const apiUrl = getApiUrl()
      const now = new Date()

      // Cargar actividades de 3 meses atrás + 6 adelante (total 9 meses)
      const allActividades: ActividadCalendario[] = []

      // Determinar las secciones a cargar
      // Si no hay secciones definidas, cargar todas (null)
      const seccionesToLoad = seccionesHijos.length > 0 ? seccionesHijos : [null]

      for (let i = -3; i < 7; i++) {
        const fecha = new Date(now.getFullYear(), now.getMonth() + i, 1)
        const anio = fecha.getFullYear()
        const mes = fecha.getMonth() + 1

        // Cargar actividades para cada sección de los hijos
        for (const seccionId of seccionesToLoad) {
          let url = `${apiUrl}/api/actividades/mes/${anio}/${mes}?visibilidad=familias`
          if (seccionId) {
            url += `&seccion_id=${seccionId}`
          }

          const response = await fetch(
            url,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )

          if (response.ok) {
            const data = await response.json()

            // Transformar datos de la API al formato esperado
            // La API ahora devuelve fechas en formato 'YYYY-MM-DD' sin timezone
            const parseFechaLocal = (fechaStr: string): Date => {
              if (!fechaStr) return new Date()

              // Si es formato YYYY-MM-DD (nuevo formato sin timezone)
              if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
                const [año, mes, dia] = fechaStr.split('-').map(Number)
                return new Date(año, mes - 1, dia, 12, 0, 0)
              }

              // Fallback para formato ISO con timezone (legacy)
              // En este caso, extraemos los componentes en timezone de España
              const d = new Date(fechaStr)
              return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0)
            }

            const actividadesMes = (data.data || []).map((act: any) => {
              // Construir objeto base
              const actividad: ActividadCalendario = {
                id: act.id.toString(),
                titulo: act.titulo,
                descripcion: act.descripcion || '',
                fechaInicio: parseFechaLocal(act.fecha_inicio),
                fechaFin: act.fecha_fin ? parseFechaLocal(act.fecha_fin) : parseFechaLocal(act.fecha_inicio),
                lugar: act.lugar || 'Colegio Patronato Juventud Obrera',
                seccion: act.seccion_nombre || '',
                seccion_id: act.seccion_id || 0,
                scoutIds: hijosIds,
                monitorResponsable: {
                  nombre: '',
                  foto: '',
                  contacto: ''
                },
                precio: act.precio,
                materialNecesario: [],
                confirmaciones: {},
                // Mantener el tipo original del backend para diferenciacion visual correcta
                tipo: act.tipo || 'actividad'
              }

              // Agregar datos de campamento si es de tipo campamento
              if (act.tipo === 'campamento') {
                actividad.campamento = {
                  lugar_salida: act.lugar_salida,
                  hora_salida: act.hora_salida,
                  mapa_salida_url: act.mapa_salida_url,
                  lugar_regreso: act.lugar_regreso,
                  hora_regreso: act.hora_regreso,
                  precio: act.precio,
                  numero_cuenta: act.numero_cuenta,
                  concepto_pago: act.concepto_pago,
                  recordatorios_predefinidos: act.recordatorios_predefinidos,
                  recordatorios_personalizados: act.recordatorios_personalizados,
                  circular_drive_id: act.circular_drive_id,
                  circular_drive_url: act.circular_drive_url,
                  circular_nombre: act.circular_nombre,
                  sheets_inscripciones_id: act.sheets_inscripciones_id
                }
              }

              return actividad
            })

            allActividades.push(...actividadesMes)
          }
        }
      }

      // Eliminar duplicados por ID
      const actividadesUnicas = allActividades.filter((act, index, self) =>
        index === self.findIndex(a => a.id === act.id)
      )

      // Cargar confirmaciones existentes y aplicarlas a las actividades
      const confirmacionesExistentes = await fetchConfirmaciones()
      setConfirmaciones(confirmacionesExistentes)

      // Aplicar confirmaciones a las actividades
      const actividadesConConfirmaciones = actividadesUnicas.map(actividad => {
        const confirmacionesActividad: { [scoutId: string]: 'confirmado' | 'pendiente' | 'no_asiste' } = {}

        confirmacionesExistentes
          .filter(c => c.actividadId === actividad.id)
          .forEach(c => {
            confirmacionesActividad[c.scoutId] = c.estado
          })

        return {
          ...actividad,
          confirmaciones: confirmacionesActividad
        }
      })

      setActividades(actividadesConConfirmaciones)

    } catch (err) {
      console.error('Error cargando actividades:', err)
      setActividades([])
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token, user, hijos, seccionesHijos, fetchConfirmaciones])

  const confirmarAsistencia = useCallback(async (
    actividadId: string,
    scoutId: string,
    estado: 'confirmado' | 'no_asiste',
    comentario?: string
  ): Promise<boolean> => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      // Llamar al endpoint correcto del backend con la estructura de datos correcta
      const response = await fetch(`${apiUrl}/api/confirmaciones/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actividad_id: parseInt(actividadId),
          scout_id: parseInt(scoutId),
          asistira: estado === 'confirmado',
          comentarios: comentario || ''
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const confirmacion = await response.json()

      // Actualizar estado local
      setActividades(prev => prev.map(actividad =>
        actividad.id === actividadId
          ? {
              ...actividad,
              confirmaciones: {
                ...actividad.confirmaciones,
                [scoutId]: estado
              }
            }
          : actividad
      ))

      setConfirmaciones(prev => [...prev, {
        ...confirmacion,
        fechaConfirmacion: new Date(confirmacion.fechaConfirmacion)
      }])

      // Invalidar cache
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(`${cacheKey}-timestamp`)

      return true
    } catch (err) {
      console.error('Error confirmando asistencia:', err)
      setError('Error al confirmar asistencia')
      return false
    }
  }, [token, cacheKey])

  const modificarConfirmacion = useCallback(async (
    confirmacionId: string,
    estado: 'confirmado' | 'no_asiste',
    comentario?: string
  ): Promise<boolean> => {
    if (!token) return false

    try {
      const apiUrl = getApiUrl()
      // Llamar al endpoint correcto del backend
      const response = await fetch(`${apiUrl}/api/confirmaciones/${confirmacionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asistira: estado === 'confirmado',
          comentarios: comentario || ''
        })
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const confirmacionActualizada = await response.json()

      // Actualizar estado local
      setConfirmaciones(prev => prev.map(conf =>
        conf.id === confirmacionId
          ? {
              ...conf,
              estado,
              comentario: comentario || conf.comentario,
              fechaConfirmacion: new Date()
            }
          : conf
      ))

      setActividades(prev => prev.map(actividad => {
        const confirmacion = confirmaciones.find(c => c.id === confirmacionId)
        if (confirmacion && actividad.id === confirmacion.actividadId) {
          return {
            ...actividad,
            confirmaciones: {
              ...actividad.confirmaciones,
              [confirmacion.scoutId]: estado
            }
          }
        }
        return actividad
      }))

      // Invalidar cache
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(`${cacheKey}-timestamp`)

      return true
    } catch (err) {
      console.error('Error modificando confirmación:', err)
      setError('Error al modificar confirmación')
      return false
    }
  }, [token, cacheKey, confirmaciones])

  // Funciones de utilidad
  const actividadesPorMes = useCallback((year: number, month: number) => {
    return actividades.filter(actividad => {
      const fecha = new Date(actividad.fechaInicio)
      return fecha.getFullYear() === year && fecha.getMonth() === month - 1
    })
  }, [actividades])

  const actividadesPorSeccion = useCallback((seccionId: number) => {
    return actividades.filter(actividad => actividad.seccion_id === seccionId)
  }, [actividades])

  const actividadesPorScout = useCallback((scoutId: string) => {
    return actividades.filter(actividad => actividad.scoutIds.includes(scoutId))
  }, [actividades])

  const proximasActividades = useCallback((dias = 30) => {
    const ahora = new Date()
    const limite = new Date(ahora.getTime() + dias * 24 * 60 * 60 * 1000)

    return actividades
      .filter(actividad => actividad.fechaInicio >= ahora && actividad.fechaInicio <= limite)
      .sort((a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime())
  }, [actividades])

  const actividadesPendientesConfirmacion = useCallback(() => {
    return actividades.filter(actividad => {
      const ahora = new Date()
      const fechaLimite = new Date(actividad.fechaInicio.getTime() - 24 * 60 * 60 * 1000) // 24 horas antes

      return actividad.fechaInicio > ahora &&
             actividad.fechaInicio > fechaLimite &&
             actividad.scoutIds.some(scoutId =>
               actividad.confirmaciones[scoutId] === 'pendiente' ||
               !actividad.confirmaciones[scoutId]
             )
    })
  }, [actividades])

  const generarICS = useCallback((actividad: ActividadCalendario): string => {
    const formatearFecha = (fecha: Date) => {
      return fecha.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '')
    }

    const inicio = formatearFecha(actividad.fechaInicio)
    const fin = formatearFecha(actividad.fechaFin)

    // Escapar caracteres especiales para ICS
    const escapeText = (text: string) => {
      return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Osyris Scout Management//Calendario//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${actividad.id}@osyris-scout.es`,
      `DTSTART:${inicio}`,
      `DTEND:${fin}`,
      `SUMMARY:${escapeText(actividad.titulo)}`,
      `DESCRIPTION:${escapeText(actividad.descripcion + '\\n\\nLugar: ' + actividad.lugar + '\\nSección: ' + actividad.seccion)}`,
      `LOCATION:${escapeText(actividad.lugar)}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      `END:VEVENT`,
      'END:VCALENDAR'
    ].join('\r\n')

    return icsContent
  }, [])

  // Efecto inicial
  useEffect(() => {
    if (isAuthenticated && token && user && hijos && hijos.length > 0) {
      fetchActividades()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, user?.id, hijos?.length])

  // Auto-refetch
  useEffect(() => {
    if (!autoRefetch || !isAuthenticated || !hijos || hijos.length === 0) return

    const interval = setInterval(() => {
      fetchActividades()
    }, refetchInterval)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefetch, refetchInterval, isAuthenticated, hijos?.length])

  const refetch = useCallback(async () => {
    await fetchActividades()
  }, [fetchActividades])

  return {
    actividades,
    loading,
    error,
    confirmaciones,
    refetch,
    confirmarAsistencia,
    modificarConfirmacion,
    actividadesPorMes,
    actividadesPorSeccion,
    actividadesPorScout,
    proximasActividades,
    actividadesPendientesConfirmacion,
    generarICS
  }
}