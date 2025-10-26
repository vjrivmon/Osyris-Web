import { useState, useEffect, useCallback } from 'react'

interface PerfilFamiliar {
  id: string
  nombre: string
  apellidos: string
  email: string
  telefono: string
  telefono_secundario?: string
  relacion: string
  foto_perfil?: string
  direccion?: string
  dni?: string
  fecha_nacimiento?: string
  ultima_actualizacion?: string
}

interface Scout {
  id: string
  nombre: string
  apellidos: string
  fecha_nacimiento: string
  seccion_actual: string
  alergias: string[]
  medicacion: string[]
  observaciones_medicas: string
  contacto_emergencia: {
    nombre: string
    telefono: string
    relacion: string
    es_principal: boolean
  }[]
}

interface Preferencias {
  tema: 'claro' | 'oscuro' | 'auto'
  idioma: 'es' | 'va'
  tamano_letra: 'pequena' | 'mediana' | 'grande' | 'extra_grande'
  contraste: 'normal' | 'alto' | 'maximo'
  animaciones: 'activadas' | 'reducidas' | 'desactivadas'
  densidad: 'compacta' | 'normal' | 'espaciada'
  formato_fecha: 'DD/MM/YYYY' | 'MM/DD/YYYY'
  formato_hora: '24h' | '12h'
  notificaciones_email: 'todas' | 'importantes' | 'ninguna'
  notificaciones_push: boolean
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errores?: string[]
}

export function usePerfilFamilia(familiarId?: string) {
  const [perfil, setPerfil] = useState<PerfilFamiliar | null>(null)
  const [scouts, setScouts] = useState<Scout[]>([])
  const [preferencias, setPreferencias] = useState<Preferencias>({
    tema: 'auto',
    idioma: 'es',
    tamano_letra: 'mediana',
    contraste: 'normal',
    animaciones: 'activadas',
    densidad: 'normal',
    formato_fecha: 'DD/MM/YYYY',
    formato_hora: '24h',
    notificaciones_email: 'importantes',
    notificaciones_push: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
    if (!familiarId) return

    setIsLoading(true)
    setError(null)

    try {
      // Cargar perfil personal
      const perfilResponse = await fetch(`/api/familia/perfil/${familiarId}`)
      if (!perfilResponse.ok) {
        throw new Error('Error al cargar el perfil')
      }
      const perfilData: ApiResponse<PerfilFamiliar> = await perfilResponse.json()

      if (perfilData.success && perfilData.data) {
        setPerfil(perfilData.data)
      }

      // Cargar scouts vinculados
      const scoutsResponse = await fetch(`/api/familia/scouts/${familiarId}`)
      if (scoutsResponse.ok) {
        const scoutsData: ApiResponse<Scout[]> = await scoutsResponse.json()
        if (scoutsData.success && scoutsData.data) {
          setScouts(scoutsData.data)
        }
      }

      // Cargar preferencias
      const prefResponse = await fetch(`/api/familia/preferencias/${familiarId}`)
      if (prefResponse.ok) {
        const prefData: ApiResponse<Preferencias> = await prefResponse.json()
        if (prefData.success && prefData.data) {
          setPreferencias(prev => ({ ...prev, ...prefData.data }))
        }
      }

    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }, [familiarId])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Actualizar perfil personal
  const actualizarPerfil = useCallback(async (datos: Partial<PerfilFamiliar>): Promise<ApiResponse<any>> => {
    if (!familiarId) {
      return { success: false, error: 'ID de familiar no proporcionado' }
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/familia/actualizar-perfil/${familiarId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      })

      const result: ApiResponse<any> = await response.json()

      if (result.success) {
        setPerfil(prev => prev ? { ...prev, ...datos, ultima_actualizacion: new Date().toISOString() } : null)
      }

      return result
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar el perfil' }
    } finally {
      setIsLoading(false)
    }
  }, [familiarId])

  // Actualizar información de un scout
  const actualizarScout = useCallback(async (scoutId: string, datos: Partial<Scout>): Promise<ApiResponse<any>> => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/familia/actualizar-scout/${scoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      })

      const result: ApiResponse<any> = await response.json()

      if (result.success) {
        setScouts(prev => prev.map(scout =>
          scout.id === scoutId ? { ...scout, ...datos } : scout
        ))
      }

      return result
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar información del scout' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Actualizar preferencias
  const actualizarPreferencias = useCallback(async (nuevasPreferencias: Partial<Preferencias>): Promise<ApiResponse<any>> => {
    if (!familiarId) {
      return { success: false, error: 'ID de familiar no proporcionado' }
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/familia/preferencias/${familiarId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevasPreferencias),
      })

      const result: ApiResponse<any> = await response.json()

      if (result.success) {
        setPreferencias(prev => ({ ...prev, ...nuevasPreferencias }))
      }

      return result
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar preferencias' }
    } finally {
      setIsLoading(false)
    }
  }, [familiarId])

  // Subir foto de perfil
  const subirFotoPerfil = useCallback(async (file: File): Promise<ApiResponse<{ url: string }>> => {
    if (!familiarId) {
      return { success: false, error: 'ID de familiar no proporcionado' }
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('foto', file)
      formData.append('familiarId', familiarId)

      const response = await fetch('/api/familia/subir-foto-perfil', {
        method: 'POST',
        body: formData,
      })

      const result: ApiResponse<{ url: string }> = await response.json()

      if (result.success && result.data) {
        setPerfil(prev => prev ? { ...prev, foto_perfil: result.data!.url } : null)
      }

      return result
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al subir la foto' }
    } finally {
      setIsLoading(false)
    }
  }, [familiarId])

  // Cambiar contraseña
  const cambiarContrasena = useCallback(async (datos: {
    contrasena_actual: string
    contrasena_nueva: string
    contrasena_confirmacion: string
  }): Promise<ApiResponse<any>> => {
    if (!familiarId) {
      return { success: false, error: 'ID de familiar no proporcionado' }
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/familia/cambiar-contrasena', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...datos, familiarId }),
      })

      return await response.json()
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al cambiar la contraseña' }
    } finally {
      setIsLoading(false)
    }
  }, [familiarId])

  // Configurar autenticación en dos pasos
  const configurar2FA = useCallback(async (datos: {
    habilitar: boolean
    codigo_verificacion?: string
  }): Promise<ApiResponse<any>> => {
    if (!familiarId) {
      return { success: false, error: 'ID de familiar no proporcionado' }
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/familia/configurar-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...datos, familiarId }),
      })

      return await response.json()
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al configurar 2FA' }
    } finally {
      setIsLoading(false)
    }
  }, [familiarId])

  // Obtener sesiones activas
  const obtenerSesionesActivas = useCallback(async (): Promise<ApiResponse<any[]>> => {
    if (!familiarId) {
      return { success: false, error: 'ID de familiar no proporcionado' }
    }

    try {
      const response = await fetch(`/api/familia/sesiones-activas/${familiarId}`)
      return await response.json()
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al obtener sesiones activas' }
    }
  }, [familiarId])

  // Cerrar sesión específica
  const cerrarSesion = useCallback(async (sessionId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`/api/familia/cerrar-sesion/${sessionId}`, {
        method: 'DELETE',
      })

      return await response.json()
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al cerrar sesión' }
    }
  }, [])

  // Refrescar todos los datos
  const refrescarDatos = useCallback(() => {
    cargarDatos()
  }, [cargarDatos])

  return {
    perfil,
    scouts,
    preferencias,
    isLoading,
    error,
    actualizarPerfil,
    actualizarScout,
    actualizarPreferencias,
    subirFotoPerfil,
    cambiarContrasena,
    configurar2FA,
    obtenerSesionesActivas,
    cerrarSesion,
    refrescarDatos,
  }
}