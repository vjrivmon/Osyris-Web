/**
 * Hook para gestionar inscripciones a campamentos
 *
 * Proporciona funcionalidad para:
 * - Obtener inscripcion existente
 * - Crear nueva inscripcion
 * - Subir circular firmada
 * - Subir justificante de pago
 * - Descargar circular del campamento
 */

import { useState, useCallback, useEffect } from 'react'
import type {
  InscripcionCampamentoCompleta,
  DatosInscripcionCampamento,
  DocumentosInscripcion,
  ActividadCampamento,
  RecordatorioPredefinido
} from '@/types/familia'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface UseInscripcionCampamentoProps {
  actividadId: number
  educandoId: number
  autoFetch?: boolean
}

interface UseInscripcionCampamentoReturn {
  // Estado
  inscripcion: InscripcionCampamentoCompleta | null
  actividad: ActividadCampamento | null
  documentos: DocumentosInscripcion | null
  datosSaludPrellenados: { alergias: string; observaciones_medicas: string } | null
  loading: boolean
  error: string | null

  // Acciones
  inscribir: (datos: DatosInscripcionCampamento) => Promise<boolean>
  marcarNoAsiste: (motivo?: string) => Promise<boolean>
  cancelarInscripcion: (motivo?: string) => Promise<boolean>
  subirCircularFirmada: (file: File) => Promise<boolean>
  subirJustificantePago: (file: File) => Promise<boolean>
  descargarCircular: () => Promise<void>

  // Refetch
  refetch: () => Promise<void>
  fetchDatosSalud: () => Promise<void>

  // Estado de documentos
  circularSubida: boolean
  justificanteSubido: boolean
  circularEnviadaSeccion: boolean
  justificanteEnviadoTesoreria: boolean

  // Progreso
  progreso: number
  pasosPendientes: string[]
}

export function useInscripcionCampamento({
  actividadId,
  educandoId,
  autoFetch = true
}: UseInscripcionCampamentoProps): UseInscripcionCampamentoReturn {
  const [inscripcion, setInscripcion] = useState<InscripcionCampamentoCompleta | null>(null)
  const [actividad, setActividad] = useState<ActividadCampamento | null>(null)
  const [documentos, setDocumentos] = useState<DocumentosInscripcion | null>(null)
  const [datosSaludPrellenados, setDatosSaludPrellenados] = useState<{
    alergias: string
    observaciones_medicas: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper para obtener token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Obtener datos de la actividad
   */
  const fetchActividad = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/actividades/${actividadId}`, {
        headers: getAuthHeaders()
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setActividad(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching actividad:', err)
    }
  }, [actividadId])

  /**
   * Verificar si existe inscripcion
   */
  const fetchInscripcion = useCallback(async () => {
    if (!actividadId || !educandoId) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `${API_URL}/api/inscripciones-campamento/verificar/${actividadId}/${educandoId}`,
        { headers: getAuthHeaders() }
      )

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.existe) {
          setInscripcion(data.data)

          // Obtener estado de documentos si existe inscripcion
          if (data.data?.id) {
            await fetchDocumentos(data.data.id)
          }
        } else {
          setInscripcion(null)
        }
      }
    } catch (err) {
      console.error('Error fetching inscripcion:', err)
      setError('Error al verificar inscripcion')
    } finally {
      setLoading(false)
    }
  }, [actividadId, educandoId])

  /**
   * Obtener estado de documentos
   */
  const fetchDocumentos = async (inscripcionId: number) => {
    try {
      const res = await fetch(
        `${API_URL}/api/inscripciones-campamento/${inscripcionId}/documentos`,
        { headers: getAuthHeaders() }
      )

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setDocumentos(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching documentos:', err)
    }
  }

  /**
   * Obtener datos de salud prellenados
   */
  const fetchDatosSalud = useCallback(async () => {
    if (!educandoId) return

    try {
      const res = await fetch(
        `${API_URL}/api/inscripciones-campamento/prellenar/${educandoId}`,
        { headers: getAuthHeaders() }
      )

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setDatosSaludPrellenados(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching datos salud:', err)
    }
  }, [educandoId])

  /**
   * Refetch all data
   */
  const refetch = useCallback(async () => {
    await Promise.all([
      fetchActividad(),
      fetchInscripcion()
    ])
  }, [fetchActividad, fetchInscripcion])

  /**
   * Inscribir a campamento
   */
  const inscribir = useCallback(async (datos: DatosInscripcionCampamento): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/api/inscripciones-campamento`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...datos,
          actividad_id: actividadId,
          educando_id: educandoId
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setInscripcion(data.data)
        return true
      } else {
        setError(data.message || 'Error al inscribir')
        return false
      }
    } catch (err) {
      console.error('Error inscribiendo:', err)
      setError('Error de conexion')
      return false
    } finally {
      setLoading(false)
    }
  }, [actividadId, educandoId])

  /**
   * Marcar como no asiste
   */
  const marcarNoAsiste = useCallback(async (motivo?: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Si ya existe inscripcion, actualizar
      if (inscripcion?.id) {
        const res = await fetch(
          `${API_URL}/api/inscripciones-campamento/${inscripcion.id}/no-asiste`,
          {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ motivo })
          }
        )

        const data = await res.json()

        if (res.ok && data.success) {
          setInscripcion(data.data)
          return true
        }
      } else {
        // Crear nueva inscripcion con no_asiste
        return await inscribir({
          actividad_id: actividadId,
          educando_id: educandoId,
          asistira: false,
          observaciones: motivo
        })
      }

      return false
    } catch (err) {
      console.error('Error marcando no asiste:', err)
      setError('Error de conexion')
      return false
    } finally {
      setLoading(false)
    }
  }, [inscripcion, actividadId, educandoId, inscribir])

  /**
   * Subir circular firmada
   */
  const subirCircularFirmada = useCallback(async (file: File): Promise<boolean> => {
    if (!inscripcion?.id) {
      setError('Debe inscribirse primero')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
      const res = await fetch(
        `${API_URL}/api/inscripciones-campamento/${inscripcion.id}/circular-firmada`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      )

      const data = await res.json()

      if (res.ok && data.success) {
        // Refetch para actualizar estado
        await fetchInscripcion()
        return true
      } else {
        setError(data.message || 'Error al subir circular')
        return false
      }
    } catch (err) {
      console.error('Error subiendo circular:', err)
      setError('Error de conexion')
      return false
    } finally {
      setLoading(false)
    }
  }, [inscripcion, fetchInscripcion])

  /**
   * Subir justificante de pago
   */
  const subirJustificantePago = useCallback(async (file: File): Promise<boolean> => {
    if (!inscripcion?.id) {
      setError('Debe inscribirse primero')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
      const res = await fetch(
        `${API_URL}/api/inscripciones-campamento/${inscripcion.id}/justificante-pago`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      )

      const data = await res.json()

      if (res.ok && data.success) {
        // Actualizar estado local inmediatamente con inscripción actualizada (incluye pagado: true)
        if (data.data?.inscripcion) {
          setInscripcion(data.data.inscripcion)
        }
        // Refetch para actualizar estado completo
        await fetchInscripcion()
        return true
      } else {
        setError(data.message || 'Error al subir justificante')
        return false
      }
    } catch (err) {
      console.error('Error subiendo justificante:', err)
      setError('Error de conexion')
      return false
    } finally {
      setLoading(false)
    }
  }, [inscripcion, fetchInscripcion])

  /**
   * Descargar circular del campamento
   */
  const descargarCircular = useCallback(async () => {
    if (!actividad?.campamento?.circular_drive_url && !actividadId) {
      setError('No hay circular disponible')
      return
    }

    try {
      // Si hay URL directa, abrir en nueva ventana
      if (actividad?.campamento?.circular_drive_url) {
        window.open(actividad.campamento.circular_drive_url, '_blank')
        return
      }

      // Si no, descargar via API
      const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/actividades/${actividadId}/circular`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Circular_Campamento_${actividadId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        setError('Error al descargar circular')
      }
    } catch (err) {
      console.error('Error descargando circular:', err)
      setError('Error de conexion')
    }
  }, [actividad, actividadId])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && actividadId && educandoId) {
      refetch()
      fetchDatosSalud()
    }
  }, [autoFetch, actividadId, educandoId, refetch, fetchDatosSalud])

  // Calcular estado derivado
  const circularSubida = !!documentos?.circular_firmada?.subida || !!inscripcion?.circular_firmada_drive_id
  const justificanteSubido = !!documentos?.justificante_pago?.subido || !!inscripcion?.justificante_pago_drive_id
  const circularEnviadaSeccion = !!documentos?.circular_firmada?.enviada_seccion || !!inscripcion?.circular_enviada_seccion
  const justificanteEnviadoTesoreria = !!documentos?.justificante_pago?.enviado_tesoreria || !!inscripcion?.justificante_enviado_tesoreria

  // Calcular progreso
  const calcularProgreso = (): number => {
    if (!inscripcion) return 0

    // Si está cancelado, progreso = 0
    if (inscripcion.estado === 'cancelado') return 0

    let completados = 0
    const total = 4

    if (inscripcion.datos_confirmados) completados++
    if (circularSubida) completados++
    if (justificanteSubido || inscripcion.pagado) completados++
    if (inscripcion.estado === 'inscrito') completados++

    return Math.round((completados / total) * 100)
  }

  // Calcular pasos pendientes
  const calcularPasosPendientes = (): string[] => {
    if (!inscripcion) return ['Confirmar asistencia']

    const pasos: string[] = []

    if (!inscripcion.datos_confirmados) {
      pasos.push('Confirmar datos')
    }
    if (!circularSubida) {
      pasos.push('Subir circular firmada')
    }
    if (!justificanteSubido && !inscripcion.pagado) {
      pasos.push('Subir justificante de pago')
    }

    return pasos
  }

  /**
   * Cancelar inscripción al campamento
   */
  const cancelarInscripcion = useCallback(async (motivo?: string): Promise<boolean> => {
    if (!inscripcion?.id) {
      setError('No hay inscripción para cancelar')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `${API_URL}/api/inscripciones-campamento/${inscripcion.id}/cancelar`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ motivo })
        }
      )

      const data = await res.json()

      if (res.ok && data.success) {
        setInscripcion(null) // Limpiar inscripción
        return true
      } else {
        setError(data.message || 'Error al cancelar inscripción')
        return false
      }
    } catch (err) {
      console.error('Error cancelando inscripción:', err)
      setError('Error de conexión')
      return false
    } finally {
      setLoading(false)
    }
  }, [inscripcion])

  return {
    // Estado
    inscripcion,
    actividad,
    documentos,
    datosSaludPrellenados,
    loading,
    error,

    // Acciones
    inscribir,
    marcarNoAsiste,
    cancelarInscripcion,
    subirCircularFirmada,
    subirJustificantePago,
    descargarCircular,

    // Refetch
    refetch,
    fetchDatosSalud,

    // Estado de documentos
    circularSubida,
    justificanteSubido,
    circularEnviadaSeccion,
    justificanteEnviadoTesoreria,

    // Progreso
    progreso: calcularProgreso(),
    pasosPendientes: calcularPasosPendientes()
  }
}

/**
 * Hook para obtener recordatorios predefinidos
 */
export function useRecordatoriosPredefinidos() {
  const [recordatorios, setRecordatorios] = useState<RecordatorioPredefinido[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRecordatorios = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/actividades/campamento/recordatorios`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setRecordatorios(data.data)
          }
        }
      } catch (err) {
        console.error('Error fetching recordatorios:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecordatorios()
  }, [])

  return { recordatorios, loading }
}

/**
 * Hook para obtener cuenta bancaria por defecto
 */
export function useCuentaBancaria() {
  const [cuentaBancaria, setCuentaBancaria] = useState<{
    numero_cuenta: string
    concepto_sugerido: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCuenta = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/actividades/campamento/cuenta-bancaria`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setCuentaBancaria(data.data)
          }
        }
      } catch (err) {
        console.error('Error fetching cuenta bancaria:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCuenta()
  }, [])

  return { cuentaBancaria, loading }
}
