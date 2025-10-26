'use client'

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  FileText,
  Camera,
  Phone,
  Users,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useFamiliaData } from "@/hooks/useFamiliaData"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { QuickActionsGroup } from "@/components/familia/quick-action-icon"
import { HijosListaCompacta } from "@/components/familia/hijo-card-compacto"
import { DocumentosListaCompacta } from "@/components/familia/documentos-lista-compacta"
import { CalendarioCompacto } from "@/components/familia/calendario-compacto"
import { ScoutHijo, Documento, TipoDocumento } from "@/types/familia"
import Link from "next/link"
import { getApiUrl } from "@/lib/api-utils"

export default function FamiliaDashboardPage() {
  const { user } = useAuth()
  const { hijos, loading, error } = useFamiliaData()
  const [userData, setUserData] = useState<any>(null)
  const [hijoSeleccionado, setHijoSeleccionado] = useState<number | undefined>(undefined)

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const apiUrl = getApiUrl()
        const response = await fetch(`${apiUrl}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            localStorage.setItem('user', JSON.stringify(data.data))
            setUserData(data.data)
            return
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }

      // Fallback: cargar desde localStorage
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr)
          setUserData(parsedUser)
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }

    fetchUserData()
  }, [])

  // Seleccionar automáticamente el primer hijo
  useEffect(() => {
    if (hijos && hijos.length > 0 && !hijoSeleccionado) {
      setHijoSeleccionado(hijos[0].id)
    }
  }, [hijos, hijoSeleccionado])

  // Obtener hijo seleccionado
  const hijoActual = useMemo(() => {
    if (!hijos || !hijoSeleccionado) return undefined
    return hijos.find(h => h.id === hijoSeleccionado)
  }, [hijos, hijoSeleccionado])

  // Convertir hijos a formato ScoutHijo sin documentos mock
  const hijosConDocumentos: ScoutHijo[] = useMemo(() => {
    if (!hijos) return []

    return hijos.map(hijo => ({
      ...hijo,
      documentos: [], // Sin documentos iniciales - se cargarán desde el backend
      documentos_estado: hijo.documentos_estado || 'pendiente' as const,
      activo: hijo.activo !== undefined ? hijo.activo : true,
      fecha_ingreso: hijo.fecha_ingreso || new Date().toISOString().split('T')[0]
    }))
  }, [hijos])

  // Acciones rápidas - solo galería
  const accionesRapidas = [
    {
      icon: Camera,
      label: 'Galería',
      href: '/familia/galeria',
      color: 'text-purple-600'
    }
  ]

  // Manejadores
  const handleUploadDocumento = (tipo: TipoDocumento) => {
    console.log('Subir documento:', tipo)
    // TODO: Implementar lógica de subida
  }

  const handleViewDocumento = (documento: Documento) => {
    console.log('Ver documento:', documento)
    // TODO: Implementar visualización
  }

  const handleDownloadDocumento = (documento: Documento) => {
    console.log('Descargar documento:', documento)
    // TODO: Implementar descarga
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-lg font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && (!hijos || hijos.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al cargar</AlertTitle>
          <AlertDescription>{error}. Intenta recargar la página.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Sin hijos vinculados
  if (!hijos || hijos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No tienes hijos vinculados</h3>
          <p className="text-muted-foreground mb-6">
            Contacta con el administrador del grupo para vincular a tus hijos y acceder a toda la información
          </p>
          <Button asChild>
            <Link href="/contacto">
              <Phone className="h-4 w-4 mr-2" />
              Contactar con el Grupo
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header con saludo e iconos de acción */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Hola, {userData?.nombre || user?.nombre || 'Familia'} 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Bienvenido al portal de familias
          </p>
        </div>

        {/* Iconos de acción rápida */}
        <QuickActionsGroup actions={accionesRapidas} />
      </div>

      {/* Mis Hijos - Tarjetas compactas */}
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold">Mis Hijos</h2>
        <HijosListaCompacta
          hijos={hijosConDocumentos}
          hijoSeleccionado={hijoSeleccionado}
          onSelectHijo={setHijoSeleccionado}
        />
      </div>

      {/* Grid: Documentos + Calendario */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Documentos del hijo seleccionado */}
        <DocumentosListaCompacta
          hijo={hijoActual}
          onUploadDocumento={handleUploadDocumento}
          onViewDocumento={handleViewDocumento}
          onDownloadDocumento={handleDownloadDocumento}
        />

        {/* Calendario */}
        <CalendarioCompacto
          seccionId={hijoActual?.seccion_id}
        />
      </div>
    </div>
  )
}
