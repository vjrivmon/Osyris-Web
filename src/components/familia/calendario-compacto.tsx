'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Tent
} from "lucide-react"
import { ActividadCalendario, ActividadCampamento, ScoutHijo } from "@/types/familia"
import { cn } from "@/lib/utils"
import { getApiUrl } from "@/lib/api-utils"
import { getTipoEventoConfig } from "./calendario/tipos-evento"
import { useFamiliaData } from "@/hooks/useFamiliaData"
import { useAuth } from "@/contexts/AuthContext"
import { InscripcionCampamentoWizard } from "./calendario/inscripcion-campamento-wizard"
import { FileText } from "lucide-react"
import Link from "next/link"

interface CalendarioCompactoProps {
  seccionId?: number
  className?: string
  hijoSeleccionado?: number  // ID del hijo seleccionado en el dashboard
}

export function CalendarioCompacto({ seccionId, className, hijoSeleccionado }: CalendarioCompactoProps) {
  const [mesActual, setMesActual] = useState(new Date())
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null)
  const [actividades, setActividades] = useState<ActividadCalendario[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null)

  // Estado para comentarios de rechazo
  const [comentarioRechazo, setComentarioRechazo] = useState<string>('')
  const [mostrandoComentario, setMostrandoComentario] = useState<number | null>(null)

  // Modal campamento
  const [campamentoModalOpen, setCampamentoModalOpen] = useState(false)
  const [actividadCampamento, setActividadCampamento] = useState<ActividadCalendario | null>(null)

  // Circulares vinculadas a actividades
  const [circularesMap, setCircularesMap] = useState<Map<number, { circularId: number, estado: string, titulo: string }>>(new Map())

  // Obtener hijos del usuario y sus secciones
  const { hijos, seccionesHijos } = useFamiliaData()

  // Obtener datos del usuario para prellenar el formulario
  const { user } = useAuth()

  // Datos del familiar para prellenar en el wizard
  const familiarData = useMemo(() => ({
    nombre: user ? `${user.nombre} ${user.apellidos || ''}`.trim() : '',
    email: user?.email || '',
    telefono: (user as any)?.telefono || ''
  }), [user])

  // Obtener el hijo correcto (seleccionado o primero como fallback)
  const hijoActual = useMemo(() => {
    if (!hijos || hijos.length === 0) return undefined
    if (hijoSeleccionado) {
      return hijos.find(h => h.id === hijoSeleccionado)
    }
    return hijos[0]
  }, [hijos, hijoSeleccionado])

  // Ref para evitar fetches duplicados
  const fetchingRef = useRef(false)
  const lastFetchKey = useRef('')
  const pendingFetchKey = useRef<string | null>(null)

  // Ref para acceder a hijoActual desde closures (siempre actualizado)
  const hijoActualRef = useRef(hijoActual)
  hijoActualRef.current = hijoActual

  // Función para obtener confirmaciones existentes de la API
  const fetchConfirmaciones = async (): Promise<Map<string, { estado: string, comentario?: string }>> => {
    const confirmacionesMap = new Map<string, { estado: string, comentario?: string }>()

    try {
      const apiUrl = getApiUrl()
      const token = localStorage.getItem('token')

      console.log('🔍 [fetchConfirmaciones] Iniciando fetch de confirmaciones...')
      console.log('🔍 [fetchConfirmaciones] Token existe:', !!token)

      if (!token) {
        console.log('❌ [fetchConfirmaciones] No hay token, retornando mapa vacío')
        return confirmacionesMap
      }

      const response = await fetch(`${apiUrl}/api/confirmaciones/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('🔍 [fetchConfirmaciones] Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 [fetchConfirmaciones] Respuesta completa:', data)

        const confirmaciones = data.data || []
        console.log('🔍 [fetchConfirmaciones] Número de confirmaciones:', confirmaciones.length)

        // Crear mapa: clave = "actividadId-educandoId", valor = estado
        confirmaciones.forEach((conf: any) => {
          const key = `${conf.actividad_id}-${conf.educando_id}`
          const estado = conf.estado || (conf.asistira ? 'confirmado' : 'rechazado')
          console.log(`🔍 [fetchConfirmaciones] Añadiendo al mapa: key=${key}, estado=${estado}, asistira=${conf.asistira}`)
          confirmacionesMap.set(key, {
            estado,
            comentario: conf.comentarios
          })
        })

        console.log('🔍 [fetchConfirmaciones] Mapa final size:', confirmacionesMap.size)
      } else {
        const errorText = await response.text()
        console.error('❌ [fetchConfirmaciones] Error en respuesta:', response.status, errorText)
      }

      // También obtener inscripciones de campamento
      const inscripcionesResponse = await fetch(`${apiUrl}/api/inscripciones-campamento/familia?proximos=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (inscripcionesResponse.ok) {
        const inscripcionesData = await inscripcionesResponse.json()
        const inscripciones = inscripcionesData.data || []
        console.log('🔍 [fetchConfirmaciones] Inscripciones de campamento:', inscripciones.length)

        inscripciones.forEach((insc: any) => {
          const key = `${insc.actividad_id}-${insc.educando_id}`
          // Mapear estado de inscripción a estado de confirmación
          let estado = 'pendiente'
          if (insc.estado === 'inscrito') estado = 'confirmado'
          else if (insc.estado === 'no_asiste') estado = 'rechazado'
          else if (insc.estado === 'pendiente') estado = 'confirmado' // pendiente en inscripción = ya inscrito, pendiente de documentos

          console.log(`🔍 [fetchConfirmaciones] Añadiendo inscripción campamento: key=${key}, estado=${estado}, original=${insc.estado}`)
          confirmacionesMap.set(key, {
            estado,
            comentario: insc.observaciones
          })
        })

        console.log('🔍 [fetchConfirmaciones] Mapa final (con inscripciones):', confirmacionesMap.size)
      }
    } catch (error) {
      console.error('❌ [fetchConfirmaciones] Error obteniendo confirmaciones:', error)
    }

    return confirmacionesMap
  }

  // Cargar actividades desde la API - carga TODOS los meses necesarios (-3 a +6)
  // Se ejecuta cuando hijoActual está disponible
  useEffect(() => {
    const fetchActividades = async (key: string) => {
      console.log('🔍 [useEffect] Starting fetch with key:', key, 'hijoActual:', hijoActual?.id)

      fetchingRef.current = true
      lastFetchKey.current = key
      setLoading(true)

      try {
        const apiUrl = getApiUrl()
        const token = localStorage.getItem('token')
        const now = new Date()
        const allActividades: ActividadCalendario[] = []

        // Cargar 10 meses: -3 hasta +6 desde el mes actual
        // Sin filtro de sección - cargar todas las actividades visibles para familias
        for (let i = -3; i < 7; i++) {
          const fecha = new Date(now.getFullYear(), now.getMonth() + i, 1)
          const anio = fecha.getFullYear()
          const mes = fecha.getMonth() + 1

          const url = seccionId
            ? `${apiUrl}/api/actividades/mes/${anio}/${mes}?visibilidad=familias&seccion_id=${seccionId}`
            : `${apiUrl}/api/actividades/mes/${anio}/${mes}?visibilidad=familias`

          try {
            const response = await fetch(url, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
              const data = await response.json()
              const actividadesTransformadas: ActividadCalendario[] = (data.data || []).map((act: any) => ({
                id: act.id,
                titulo: act.titulo,
                descripcion: act.descripcion || '',
                fecha: act.fecha_inicio?.split('T')[0] || act.fecha_inicio,
                fechaFin: act.fecha_fin?.split('T')[0] || act.fecha_fin,
                hora: act.hora_inicio || new Date(act.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                horaFin: act.hora_fin,
                lugar: act.lugar || 'Colegio Patronato Juventud Obrera',
                seccion: act.seccion_nombre || '',
                seccion_id: act.seccion_id,
                tipo: act.tipo === 'reunion_sabado' ? 'reunion' :
                      act.tipo === 'campamento' ? 'campamento' :
                      act.tipo === 'salida' ? 'excursion' : act.tipo,
                tipoOriginal: act.tipo,
                confirmacion: 'pendiente', // Se actualizará después con las confirmaciones reales
                requiere_confirmacion: act.inscripcion_abierta !== false,
                costo: act.precio,
                // Campos específicos de campamento (se incluyen para todos pero solo se usan en campamentos)
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
              }))
              allActividades.push(...actividadesTransformadas)
            }
          } catch (err) {
            console.error(`Error cargando mes ${anio}/${mes}:`, err)
          }
        }

        // Eliminar duplicados por ID
        const actividadesUnicas = allActividades.filter((act, index, self) =>
          index === self.findIndex(a => a.id === act.id)
        )

        // OBTENER CONFIRMACIONES EXISTENTES DE LA API
        // Usar hijoActualRef para obtener el valor más reciente (no el del closure)
        const currentHijoActual = hijoActualRef.current
        console.log('🔍 [useEffect] Llamando fetchConfirmaciones...')
        console.log('🔍 [useEffect] hijoActual (from ref):', currentHijoActual)
        const confirmacionesMap = await fetchConfirmaciones()
        console.log('🔍 [useEffect] confirmacionesMap size:', confirmacionesMap.size)

        // Mapear confirmaciones a actividades usando el hijo actual
        const actividadesConConfirmaciones = actividadesUnicas.map(actividad => {
          if (currentHijoActual) {
            const key = `${actividad.id}-${currentHijoActual.id}`
            const confirmacionData = confirmacionesMap.get(key)
            console.log(`🔍 [mapping] Actividad ${actividad.id} (${actividad.titulo}): key=${key}, encontrado=${!!confirmacionData}`)
            if (confirmacionData) {
              console.log(`✅ [mapping] Aplicando estado '${confirmacionData.estado}' a actividad ${actividad.id}`)
              return {
                ...actividad,
                confirmacion: confirmacionData.estado as 'pendiente' | 'confirmado' | 'rechazado'
              }
            }
          } else {
            console.log(`⚠️ [mapping] hijoActual es undefined, no se puede mapear actividad ${actividad.id}`)
          }
          return actividad
        })

        console.log('🔍 [useEffect] actividadesConConfirmaciones:', actividadesConConfirmaciones.map(a => ({ id: a.id, titulo: a.titulo, confirmacion: a.confirmacion })))

        // Actualizar lastFetchKey con el hijoActual que realmente usamos para el mapeo
        // Esto evita re-fetch innecesario si hijoActual cambió durante el fetch
        const actualKey = `${seccionId || 'all'}-${currentHijoActual?.id || 'none'}`
        if (actualKey !== lastFetchKey.current) {
          console.log('🔍 [useEffect] Actualizando lastFetchKey:', lastFetchKey.current, '→', actualKey)
          lastFetchKey.current = actualKey
        }

        setActividades(actividadesConConfirmaciones)
      } catch (error) {
        console.error('Error cargando actividades:', error)
      } finally {
        setLoading(false)
        fetchingRef.current = false

        // Si hay un fetch pendiente (la clave cambió durante este fetch), ejecutarlo ahora
        // Usar hijoActualRef para obtener el valor más reciente
        const currentHijo = hijoActualRef.current
        const currentKey = `${seccionId || 'all'}-${currentHijo?.id || 'none'}`

        if (currentKey !== lastFetchKey.current) {
          console.log('🔄 [useEffect] hijoActual cambió durante el fetch. Key actual:', currentKey, 'Key del fetch:', lastFetchKey.current)
          pendingFetchKey.current = null // Limpiar cualquier pendiente
          console.log('🔄 [useEffect] Re-ejecutando fetch con nuevo hijoActual:', currentHijo?.id)
          fetchActividades(currentKey)
        } else if (pendingFetchKey.current && pendingFetchKey.current !== lastFetchKey.current) {
          const nextKey = pendingFetchKey.current
          pendingFetchKey.current = null
          console.log('🔄 [useEffect] Ejecutando fetch pendiente con key:', nextKey)
          fetchActividades(nextKey)
        }
      }
    }

    // Crear una clave única para este fetch basada en seccionId y hijoActual
    const fetchKey = `${seccionId || 'all'}-${hijoActual?.id || 'none'}`

    // Si la clave es la misma que la última, no hacer nada
    if (lastFetchKey.current === fetchKey) {
      console.log('🔍 [useEffect] Skipping - already fetched with same key:', fetchKey)
      return
    }

    // Si hay un fetch en progreso, guardar la nueva clave como pendiente
    if (fetchingRef.current) {
      console.log('🔍 [useEffect] Fetch in progress, queuing key:', fetchKey)
      pendingFetchKey.current = fetchKey
      return
    }

    // Ejecutar el fetch
    fetchActividades(fetchKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seccionId, hijoActual?.id]) // Re-ejecutar si cambia seccionId o el hijo actual

  // Comprobar qué actividades tienen circular digital vinculada
  useEffect(() => {
    const checkCirculares = async () => {
      if (actividades.length === 0 || !hijoActual) return

      const apiUrl = getApiUrl()
      const token = localStorage.getItem('token')
      if (!token) return

      const newMap = new Map<number, { circularId: number, estado: string, titulo: string }>()

      // Check each activity (in parallel, max 5 concurrent)
      const checks = actividades.map(async (act) => {
        try {
          const res = await fetch(
            `${apiUrl}/api/circulares/check-actividad/${act.id}?educandoId=${hijoActual.id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          )
          if (res.ok) {
            const data = await res.json()
            if (data.data?.hasCircular) {
              newMap.set(act.id, {
                circularId: data.data.circularId,
                estado: data.data.estado || 'pendiente',
                titulo: data.data.titulo || ''
              })
            }
          }
        } catch (err) {
          // silently skip
        }
      })

      await Promise.all(checks)
      setCircularesMap(newMap)
    }

    checkCirculares()
  }, [actividades, hijoActual])

  // Obtener actividades del mes actual
  const actividadesMes = useMemo(() => {
    return actividades.filter(actividad => {
      const fechaActividad = new Date(actividad.fecha)
      return (
        fechaActividad.getMonth() === mesActual.getMonth() &&
        fechaActividad.getFullYear() === mesActual.getFullYear()
      )
    })
  }, [actividades, mesActual])

  // Obtener próxima actividad (solo 1)
  const proximaActividad = useMemo(() => {
    const hoy = new Date()
    const dentro30Dias = new Date()
    dentro30Dias.setDate(hoy.getDate() + 30)

    const proximas = actividades
      .filter(actividad => {
        const fechaActividad = new Date(actividad.fecha)
        return fechaActividad >= hoy && fechaActividad <= dentro30Dias
      })
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    return proximas[0] || null
  }, [actividades])

  // Generar días del calendario (Lunes a Domingo)
  const diasCalendario = useMemo(() => {
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1)
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0)
    // Convertir para que Lunes = 0, Domingo = 6
    const primerDiaSemana = (primerDia.getDay() + 6) % 7
    const diasMes = ultimoDia.getDate()

    const dias: (Date | null)[] = []

    // Añadir días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null)
    }

    // Añadir días del mes
    for (let dia = 1; dia <= diasMes; dia++) {
      dias.push(new Date(mesActual.getFullYear(), mesActual.getMonth(), dia))
    }

    return dias
  }, [mesActual])

  // Obtener actividades de un día (incluyendo rangos de campamentos)
  const getActividadesDelDia = useCallback((dia: Date) => {
    return actividades.filter(actividad => {
      const fechaInicio = new Date(actividad.fecha)
      const fechaFin = actividad.fechaFin ? new Date(actividad.fechaFin) : fechaInicio
      const d = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate())
      const i = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate())
      const f = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate())
      if (actividad.tipo === 'campamento' || actividad.tipoOriginal === 'campamento') {
        return d >= i && d <= f
      }
      return d.getTime() === i.getTime()
    })
  }, [actividades])

  // Obtener posición de un día dentro de un campamento multi-día
  // Retorna null si no hay campamento, o la posición con ajuste por fila del grid
  const getCampamentoPosition = useCallback((dia: Date, indexEnGrid: number): null | 'solo' | 'inicio' | 'medio' | 'fin' => {
    const d = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate())
    for (const actividad of actividades) {
      if (actividad.tipo !== 'campamento' && actividad.tipoOriginal !== 'campamento') continue
      const fechaInicio = new Date(actividad.fecha)
      const fechaFin = actividad.fechaFin ? new Date(actividad.fechaFin) : fechaInicio
      const i = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate())
      const f = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate())
      if (d < i || d > f) continue
      // Es un día de campamento
      if (i.getTime() === f.getTime()) return 'solo'
      const esInicio = d.getTime() === i.getTime()
      const esFin = d.getTime() === f.getTime()
      // Ajuste por fila: lunes (col 0) siempre es inicio visual, domingo (col 6) siempre es fin visual
      const colEnGrid = indexEnGrid % 7
      const esInicioFila = colEnGrid === 0
      const esFinFila = colEnGrid === 6
      if (esInicio && esFin) return 'solo'
      if ((esInicio || esInicioFila) && (esFin || esFinFila)) return 'solo'
      if (esInicio || esInicioFila) return 'inicio'
      if (esFin || esFinFila) return 'fin'
      return 'medio'
    }
    return null
  }, [actividades])

  // Obtener tipos de evento activos en el mes (para la leyenda)
  const tiposActivosMes = useMemo(() => {
    const tiposSet = new Set<string>()
    actividades.forEach(act => {
      const fechaInicio = new Date(act.fecha)
      const fechaFin = act.fechaFin ? new Date(act.fechaFin) : fechaInicio
      // Verificar si la actividad cae en el mes actual
      const mesInicio = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1)
      const mesFin = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0)
      if (fechaInicio <= mesFin && fechaFin >= mesInicio) {
        tiposSet.add(act.tipoOriginal || act.tipo)
      }
    })
    return Array.from(tiposSet)
  }, [actividades, mesActual])

  // Actividades del día seleccionado (incluyendo campamentos multi-día)
  const actividadesDia = useMemo(() => {
    if (!diaSeleccionado) return []
    return getActividadesDelDia(diaSeleccionado)
  }, [diaSeleccionado, getActividadesDelDia])

  const mesAnterior = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))
  }

  const mesSiguiente = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))
  }

  const getTipoColor = (tipo: ActividadCalendario['tipo']) => {
    switch (tipo) {
      case 'reunion':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'campamento':
        return 'bg-primary/20 dark:bg-primary/30 text-primary border-primary/30 dark:border-primary/40'
      case 'excursion':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'actividad_especial':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      case 'formacion':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
  }

  const getConfirmacionBadge = (confirmacion?: string) => {
    switch (confirmacion) {
      case 'confirmado':
        return (
          <Badge variant="outline" className="bg-primary/20 dark:bg-primary/30 text-primary border-primary/30 dark:border-primary/40">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmado
          </Badge>
        )
      case 'pendiente':
        return (
          <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      case 'rechazado':
        return (
          <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
            Rechazado
          </Badge>
        )
      default:
        return null
    }
  }

  // Función para confirmar asistencia a reunión
  const handleConfirmacion = async (actividadId: number, asistira: boolean, comentario?: string) => {
    if (!hijoActual) {
      console.error('No hay hijo seleccionado')
      return
    }

    setConfirmandoId(actividadId)

    try {
      const apiUrl = getApiUrl()
      const token = localStorage.getItem('token')

      const body: any = {
        actividad_id: actividadId,
        scout_id: hijoActual.id,
        asistira
      }

      // Añadir comentario si existe (obligatorio para rechazos)
      if (comentario && comentario.trim()) {
        body.comentarios = comentario.trim()
      }

      const response = await fetch(`${apiUrl}/api/confirmaciones`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        // Actualizar estado local
        setActividades(prev => prev.map(act =>
          act.id === actividadId
            ? { ...act, confirmacion: asistira ? 'confirmado' : 'rechazado' }
            : act
        ))
        // Limpiar estado de comentario
        setComentarioRechazo('')
        setMostrandoComentario(null)
      } else {
        console.error('Error al confirmar:', await response.text())
      }
    } catch (error) {
      console.error('Error al confirmar asistencia:', error)
    } finally {
      setConfirmandoId(null)
    }
  }

  // Función para iniciar el proceso de rechazo (mostrar campo de comentario)
  const handleIniciarRechazo = (actividadId: number) => {
    setMostrandoComentario(actividadId)
    setComentarioRechazo('')
  }

  // Función para cancelar el rechazo
  const handleCancelarRechazo = () => {
    setMostrandoComentario(null)
    setComentarioRechazo('')
  }

  // Función para confirmar el rechazo con comentario
  const handleConfirmarRechazo = (actividadId: number) => {
    if (!comentarioRechazo.trim()) {
      return // No permitir rechazar sin comentario
    }
    handleConfirmacion(actividadId, false, comentarioRechazo)
  }

  // Función para abrir wizard de campamento
  const handleAbrirCampamento = (actividad: ActividadCalendario) => {
    if (!hijoActual) return
    setActividadCampamento(actividad)
    setCampamentoModalOpen(true)
  }

  const hoy = new Date()

  // Renderizar tarjeta de actividad
  const renderActividadCard = (actividad: ActividadCalendario) => {
    const esCampamento = actividad.tipo === 'campamento' || actividad.tipoOriginal === 'campamento'
    const estaConfirmando = confirmandoId === actividad.id
    const circularInfo = circularesMap.get(actividad.id)
    const tieneCircular = !!circularInfo

    return (
      <div
        key={actividad.id}
        className="p-3 rounded-lg border hover:shadow-sm transition-shadow"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h5 className="font-medium text-sm truncate">{actividad.titulo}</h5>
          </div>
          {/* Badge de confirmación o circular */}
          {tieneCircular && circularInfo.estado === 'firmada' ? (
            <div className="flex-shrink-0">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Firmada
              </Badge>
            </div>
          ) : tieneCircular && actividad.confirmacion === 'confirmado' && circularInfo.estado !== 'firmada' ? (
            <div className="flex-shrink-0">
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                <FileText className="h-3 w-3 mr-1" />
                Pendiente de firma
              </Badge>
            </div>
          ) : actividad.confirmacion ? (
            <div className="flex-shrink-0">
              {getConfirmacionBadge(actividad.confirmacion)}
            </div>
          ) : null}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{new Date(actividad.fecha).toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}</span>
            <Clock className="h-3 w-3 ml-2" />
            <span>{actividad.hora}{actividad.horaFin ? ` - ${actividad.horaFin}` : ''}</span>
          </div>

          {actividad.lugar && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{actividad.lugar}</span>
            </div>
          )}

          {actividad.costo && (
            <div className="flex items-center space-x-1 font-medium text-foreground">
              <span>Coste: €{actividad.costo}</span>
            </div>
          )}
        </div>

        {actividad.confirmacion === 'pendiente' && hijoActual && (
          <div className="mt-3">
            {esCampamento ? (
              // Botón especial para campamentos
              <Button
                size="sm"
                className="w-full text-xs bg-primary hover:bg-primary/90"
                onClick={() => handleAbrirCampamento(actividad)}
              >
                <Tent className="h-3 w-3 mr-1" />
                Inscribirse al Campamento
              </Button>
            ) : mostrandoComentario === actividad.id ? (
              // Mostrar campo de comentario para rechazo
              <div className="space-y-2">
                <Textarea
                  placeholder="Indica el motivo por el que no podrás asistir..."
                  value={comentarioRechazo}
                  onChange={(e) => setComentarioRechazo(e.target.value)}
                  className="text-xs min-h-[60px]"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={handleCancelarRechazo}
                    disabled={estaConfirmando}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 text-xs"
                    onClick={() => handleConfirmarRechazo(actividad.id)}
                    disabled={estaConfirmando || !comentarioRechazo.trim()}
                  >
                    {estaConfirmando ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Confirmar'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // Botones normales para reuniones (No Asistirá izquierda, Asistirá derecha)
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => handleIniciarRechazo(actividad.id)}
                  disabled={estaConfirmando}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  No Asistirá
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleConfirmacion(actividad.id, true)}
                  disabled={estaConfirmando}
                >
                  {estaConfirmando ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Asistirá
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Botón circular digital — solo si ya confirmó asistencia y tiene circular */}
        {tieneCircular && hijoActual && actividad.confirmacion === 'confirmado' && circularInfo.estado !== 'firmada' && (
          <div className="mt-3">
            <Link href={`/familia/circulares?actividad=${actividad.id}&educando=${hijoActual.id}`}>
              <Button
                size="sm"
                className="w-full text-xs bg-amber-600 hover:bg-amber-700 text-white"
              >
                <FileText className="h-3 w-3 mr-1" />
                Firmar autorización
              </Button>
            </Link>
          </div>
        )}

        {tieneCircular && circularInfo.estado === 'firmada' && (
          <div className="mt-3">
            <div className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Autorización firmada
            </div>
          </div>
        )}

        {/* Botón para cambiar asistencia ya confirmada/rechazada (NO campamentos, sin circular o circular ya firmada) */}
        {!tieneCircular && actividad.confirmacion && actividad.confirmacion !== 'pendiente' && hijoActual && !esCampamento && (
          <div className="mt-3">
            {actividad.confirmacion === 'confirmado' ? (
              mostrandoComentario === actividad.id ? (
                // Mostrar campo de comentario para cancelar asistencia
                <div className="space-y-2">
                  <Textarea
                    placeholder="Indica el motivo por el que ya no podrás asistir..."
                    value={comentarioRechazo}
                    onChange={(e) => setComentarioRechazo(e.target.value)}
                    className="text-xs min-h-[60px]"
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={handleCancelarRechazo}
                      disabled={estaConfirmando}
                    >
                      Volver
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 text-xs"
                      onClick={() => handleConfirmarRechazo(actividad.id)}
                      disabled={estaConfirmando || !comentarioRechazo.trim()}
                    >
                      {estaConfirmando ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Confirmar cancelación'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300"
                  onClick={() => handleIniciarRechazo(actividad.id)}
                  disabled={estaConfirmando}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancelar asistencia
                </Button>
              )
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs text-primary border-primary/30 dark:border-primary/40 hover:bg-primary/10 dark:hover:bg-primary/20"
                onClick={() => handleConfirmacion(actividad.id, true)}
                disabled={estaConfirmando}
              >
                {estaConfirmando ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ahora sí asistiré
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Botón para cambiar de opinión en CAMPAMENTOS rechazados */}
        {esCampamento && actividad.confirmacion === 'rechazado' && hijoActual && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs text-primary border-primary/30 dark:border-primary/40 hover:bg-primary/10 dark:hover:bg-primary/20"
              onClick={() => handleAbrirCampamento(actividad)}
            >
              <Tent className="h-3 w-3 mr-1" />
              He cambiado de opinión, quiero inscribirme
            </Button>
          </div>
        )}

        {/* Botón para ver/gestionar inscripción en CAMPAMENTOS confirmados */}
        {esCampamento && actividad.confirmacion === 'confirmado' && hijoActual && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => handleAbrirCampamento(actividad)}
            >
              <Tent className="h-3 w-3 mr-1" />
              Ver inscripción
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Calendario</span>
              </CardTitle>
              <CardDescription className="mt-1">
                {actividadesMes.length} actividad{actividadesMes.length !== 1 ? 'es' : ''} este mes
              </CardDescription>
            </div>

            {/* Navegación de meses - siempre inline */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={mesAnterior}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium min-w-[70px] sm:min-w-[120px] text-center">
                <span className="sm:hidden">{mesActual.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                <span className="hidden sm:inline">{mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={mesSiguiente}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Mini calendario */}
          <div className="mb-4">
            {/* Leyenda de tipos de evento */}
            {tiposActivosMes.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
                {tiposActivosMes.map(tipo => {
                  const config = getTipoEventoConfig(tipo)
                  return (
                    <div key={tipo} className="flex items-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                      <span className="text-xs text-muted-foreground">{config.label}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Días de la semana (Lunes a Domingo) */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(dia => (
                <div key={dia} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-y-1 gap-x-0">
              {diasCalendario.map((dia, index) => {
                if (!dia) {
                  return <div key={index} className="aspect-square" />
                }

                const esHoy =
                  dia.getDate() === hoy.getDate() &&
                  dia.getMonth() === hoy.getMonth() &&
                  dia.getFullYear() === hoy.getFullYear()

                const eventosDelDia = getActividadesDelDia(dia)
                const campPos = getCampamentoPosition(dia, index)
                const esSeleccionado = diaSeleccionado &&
                  dia.getDate() === diaSeleccionado.getDate() &&
                  dia.getMonth() === diaSeleccionado.getMonth()

                // Tipos únicos para los puntos (excluir campamento si tiene fondo)
                const tiposUnicos = [...new Set(
                  eventosDelDia
                    .filter(e => {
                      if (!campPos) return true // No hay campamento, mostrar todos
                      return e.tipo !== 'campamento' && e.tipoOriginal !== 'campamento'
                    })
                    .map(e => e.tipoOriginal || e.tipo)
                )].slice(0, 3)

                // Clases de fondo y borde para campamento multi-día
                const campBgClass = campPos && !esHoy ? cn(
                  "bg-green-100 dark:bg-green-900/30 border border-green-600/40 dark:border-green-500/40",
                  campPos === 'inicio' && "rounded-l-md rounded-r-none border-r-0",
                  campPos === 'fin' && "rounded-r-md rounded-l-none border-l-0",
                  campPos === 'medio' && "rounded-none border-l-0 border-r-0",
                  campPos === 'solo' && "rounded-md"
                ) : null

                return (
                  <button
                    key={index}
                    onClick={() => setDiaSeleccionado(dia)}
                    className={cn(
                      "aspect-square text-sm flex flex-col items-center justify-center relative transition-all duration-200",
                      "hover:bg-primary/30 hover:shadow-sm hover:scale-105",
                      // Campamento background (sin rounded propio, lo pone campBgClass)
                      campBgClass,
                      // Si no hay campamento, redondear normal
                      !campPos && "rounded-md",
                      esHoy && "bg-primary text-primary-foreground font-bold rounded-md z-10",
                      esSeleccionado && !esHoy && "ring-2 ring-primary bg-primary/10 rounded-md z-10",
                      !esHoy && !esSeleccionado && !campPos && "text-foreground"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      esHoy ? "text-primary-foreground" : "text-foreground"
                    )}>{dia.getDate()}</span>
                    {/* Puntos coloreados por tipo de evento */}
                    {tiposUnicos.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {tiposUnicos.map(tipo => {
                          const config = getTipoEventoConfig(tipo)
                          return (
                            <div
                              key={tipo}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                esHoy ? "bg-primary-foreground" : config.dotColor
                              )}
                            />
                          )
                        })}
                      </div>
                    )}
                    {/* Si es campamento sin otros eventos, no mostrar punto (el fondo basta) */}
                    {campPos && tiposUnicos.length === 0 && !esHoy && (
                      <div className="w-1.5 h-1.5 mt-0.5" /> // Spacer para mantener altura consistente
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actividades del día seleccionado */}
          {diaSeleccionado && actividadesDia.length > 0 && (
            <div className="space-y-3 mb-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm">
                Actividades del {diaSeleccionado.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h4>
              <div className="space-y-2">
                {actividadesDia.map(actividad => renderActividadCard(actividad))}
              </div>
            </div>
          )}

          {/* Próxima actividad */}
          {!loading && proximaActividad && (
            <div className="space-y-2">
              {renderActividadCard(proximaActividad)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wizard de inscripción a campamento (mismo que calendario-view) */}
      {actividadCampamento && hijoActual && (
        <InscripcionCampamentoWizard
          key={`wizard-${actividadCampamento.id}-${hijoActual.id}`}
          isOpen={campamentoModalOpen}
          onClose={() => {
            setCampamentoModalOpen(false)
            setActividadCampamento(null)
          }}
          actividad={{
            id: actividadCampamento.id,
            titulo: actividadCampamento.titulo,
            descripcion: actividadCampamento.descripcion || '',
            fecha: actividadCampamento.fecha,
            fechaFin: actividadCampamento.fechaFin,
            lugar: actividadCampamento.lugar,
            costo: actividadCampamento.costo,
            scoutIds: [hijoActual.id.toString()],
            confirmaciones: {},
            campamento: {
              lugar_salida: (actividadCampamento as any).lugar_salida,
              hora_salida: (actividadCampamento as any).hora_salida,
              mapa_salida_url: (actividadCampamento as any).mapa_salida_url,
              lugar_regreso: (actividadCampamento as any).lugar_regreso,
              hora_regreso: (actividadCampamento as any).hora_regreso,
              numero_cuenta: (actividadCampamento as any).numero_cuenta,
              concepto_pago: (actividadCampamento as any).concepto_pago,
              recordatorios_predefinidos: (actividadCampamento as any).recordatorios_predefinidos,
              recordatorios_personalizados: (actividadCampamento as any).recordatorios_personalizados,
              circular_drive_id: (actividadCampamento as any).circular_drive_id,
              circular_drive_url: (actividadCampamento as any).circular_drive_url,
              circular_nombre: (actividadCampamento as any).circular_nombre
            }
          }}
          educando={hijoActual as ScoutHijo}
          familiarData={familiarData}
        />
      )}
    </>
  )
}
