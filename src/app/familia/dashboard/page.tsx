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
import { useGoogleDrive } from "@/hooks/useGoogleDrive"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { QuickActionIcon, QuickActionsGroup } from "@/components/familia/quick-action-icon"
import { HijoCardCompacto, HijosListaCompacta } from "@/components/familia/hijo-card-compacto"
import { DocumentosListaCompacta } from "@/components/familia/documentos-lista-compacta"
import { CalendarioCompacto } from "@/components/familia/calendario-compacto"
import { DocumentoUploadModal } from "@/components/familia/documento-upload-modal"
import { DocumentoResubirModal } from "@/components/familia/documentos/documento-resubir-modal"
import { MensajesMonitorCompacto } from "@/components/familia/mensajes-monitor-compacto"
import { ScoutHijo, Documento, TipoDocumento } from "@/types/familia"
import Link from "next/link"
import { getApiUrl } from "@/lib/api-utils"

// Tipo para almacenar documentos de todos los hijos
interface DocumentosCache {
  [hijoId: number]: {
    status: Record<string, any>
    resumen: { total: number; completos: number; faltantes: number }
  }
}

export default function FamiliaDashboardPage() {
  const { user } = useAuth()
  const { hijos, loading, error } = useFamiliaData()
  const {
    fetchEducandoDocumentos,
    fetchPlantillas,
    downloadPlantilla,
    uploadDocumento,
    estructuraEducando,
    plantillas,
    loading: driveLoading
  } = useGoogleDrive()
  const [userData, setUserData] = useState<any>(null)
  const [hijoSeleccionado, setHijoSeleccionado] = useState<number | undefined>(undefined)
  // Estado separado para el acordeón mobile (null = todos colapsados)
  const [mobileExpandido, setMobileExpandido] = useState<number | undefined>(undefined)
  const [documentosCache, setDocumentosCache] = useState<DocumentosCache>({})
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadTipoDocumento, setUploadTipoDocumento] = useState<TipoDocumento | null>(null)
  const [resubirModalOpen, setResubirModalOpen] = useState(false)
  const [documentoParaResubir, setDocumentoParaResubir] = useState<{
    id: number;
    titulo: string;
    tipo_documento: string;
    educando_id: number;
    educando_nombre?: string;
  } | null>(null)

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

  // Cargar plantillas al inicio
  useEffect(() => {
    fetchPlantillas()
  }, [fetchPlantillas])

  // Auto-seleccionar primer hijo para desktop (documentos panel necesita uno seleccionado)
  // En mobile el acordeón maneja el estado colapsado sin selección
  useEffect(() => {
    if (hijos && hijos.length > 0) {
      if (hijoSeleccionado) {
        const exists = hijos.find(h => h.id === hijoSeleccionado)
        if (!exists) {
          setHijoSeleccionado(hijos[0].id)
        }
      } else {
        // Auto-seleccionar el primero (desktop lo necesita)
        setHijoSeleccionado(hijos[0].id)
      }
    }
  }, [hijos])

  // Cargar documentos de TODOS los hijos al inicio
  useEffect(() => {
    const fetchAllDocumentos = async () => {
      if (!hijos || hijos.length === 0) return

      console.log('📄 Cargando documentos de Drive para todos los hijos...')
      for (const hijo of hijos) {
        if (!documentosCache[hijo.id]) {
          const data = await fetchEducandoDocumentos(hijo.id)
          if (data) {
            setDocumentosCache(prev => ({
              ...prev,
              [hijo.id]: {
                status: data.status,
                resumen: data.resumen
              }
            }))
          }
        }
      }
    }

    fetchAllDocumentos()
  }, [hijos])

  // Actualizar cache cuando se carguen documentos del hijo seleccionado
  // IMPORTANTE: Solo actualizar si el educando en estructuraEducando coincide con hijoSeleccionado
  // para evitar que datos de un hijo se guarden bajo el ID de otro
  useEffect(() => {
    if (estructuraEducando && hijoSeleccionado && estructuraEducando.educando?.id === hijoSeleccionado) {
      setDocumentosCache(prev => ({
        ...prev,
        [hijoSeleccionado]: {
          status: estructuraEducando.status,
          resumen: estructuraEducando.resumen
        }
      }))
    }
  }, [estructuraEducando, hijoSeleccionado])

  // Cargar documentos del hijo seleccionado desde Google Drive
  useEffect(() => {
    if (hijoSeleccionado) {
      console.log('📄 Cargando documentos de Drive para educando:', hijoSeleccionado)
      fetchEducandoDocumentos(hijoSeleccionado)
    }
  }, [hijoSeleccionado, fetchEducandoDocumentos])

  // Obtener hijo seleccionado
  const hijoActual = useMemo(() => {
    if (!hijos || !hijoSeleccionado) return undefined
    return hijos.find(h => h.id === hijoSeleccionado)
  }, [hijos, hijoSeleccionado])

  // Obtener estructura del educando DESDE EL CACHE (no desde estructuraEducando compartido)
  // Esto evita que los datos de un hijo se muestren para otro
  const estructuraEducandoActual = useMemo(() => {
    if (!hijoSeleccionado) return null

    const cachedData = documentosCache[hijoSeleccionado]
    if (cachedData) {
      return {
        educando: hijoActual ? {
          id: hijoActual.id,
          nombre: hijoActual.nombre,
          apellidos: hijoActual.apellidos,
          seccion: hijoActual.seccion || ''
        } : null,
        folder: estructuraEducando?.folder || { id: '', name: '' },
        documentos: estructuraEducando?.documentos || [],
        status: cachedData.status,
        resumen: {
          ...cachedData.resumen,
          opcionalesFaltantes: (cachedData.resumen as any).opcionalesFaltantes || 0
        }
      }
    }

    // Si no está en cache, usar estructuraEducando solo si coincide con el hijo seleccionado
    if (estructuraEducando?.educando?.id === hijoSeleccionado) {
      return estructuraEducando
    }

    return null
  }, [hijoSeleccionado, documentosCache, estructuraEducando, hijoActual])

  // Convertir datos de Drive a formato Documento (usando cache)
  const documentosDelHijo: Documento[] = useMemo(() => {
    if (!estructuraEducandoActual?.status) return []

    return Object.entries(estructuraEducandoActual.status).map(([tipo, status]: [string, any]) => ({
      id: status.archivo?.id ? parseInt(status.archivo.id) : undefined,
      tipo: tipo as TipoDocumento,
      label: status.nombre,
      estado: status.estado === 'subido' ? 'actualizado' as const : 'falta' as const,
      fecha_subida: status.archivo?.createdTime,
      url_archivo: status.archivo?.webViewLink
    }))
  }, [estructuraEducandoActual])

  // Convertir hijos a formato ScoutHijo con documentos de Drive (usando cache para todos)
  const hijosConDocumentos: ScoutHijo[] = useMemo(() => {
    if (!hijos) return []

    return hijos.map(hijo => {
      // Usar datos del cache para TODOS los hijos (no solo el seleccionado)
      const cachedData = documentosCache[hijo.id]
      const docs: Documento[] = cachedData?.status
        ? Object.entries(cachedData.status).map(([tipo, status]: [string, any]) => ({
            id: status.archivo?.id ? parseInt(status.archivo.id) : undefined,
            tipo: tipo as TipoDocumento,
            label: status.nombre,
            estado: status.estado === 'subido' ? 'actualizado' as const : 'falta' as const,
            fecha_subida: status.archivo?.createdTime,
            url_archivo: status.archivo?.webViewLink
          }))
        : []

      const completos = docs.filter(d => d.estado === 'actualizado').length
      const total = 5 // Documentos obligatorios

      return {
        ...hijo,
        documentos: docs,
        documentos_estado: completos === total ? 'completo' as const :
          completos > 0 ? 'pendiente' as const : 'pendiente' as const,
        activo: hijo.activo !== undefined ? hijo.activo : true,
        fecha_ingreso: hijo.fecha_ingreso || new Date().toISOString().split('T')[0]
      }
    })
  }, [hijos, documentosCache])

  // Manejadores
  const handleUploadDocumento = (tipo: TipoDocumento) => {
    setUploadTipoDocumento(tipo)
    setUploadModalOpen(true)
  }

  // Handler para resubir documento (nueva versión)
  const handleResubirDocumento = (tipo: TipoDocumento, documentoId?: number) => {
    if (!hijoActual) return

    // Obtener datos del documento desde el cache
    const cachedData = documentosCache[hijoActual.id]
    const docData = cachedData?.status?.[tipo]

    // Crear objeto documento para el modal
    setDocumentoParaResubir({
      id: documentoId || (docData?.archivo?.id ? parseInt(docData.archivo.id) : 0),
      titulo: docData?.nombre || tipo,
      tipo_documento: tipo,
      educando_id: hijoActual.id,
      educando_nombre: `${hijoActual.nombre} ${hijoActual.apellidos}`
    })
    setResubirModalOpen(true)
  }

  const handleResubirSuccess = () => {
    // Recargar documentos del hijo seleccionado
    if (hijoSeleccionado) {
      fetchEducandoDocumentos(hijoSeleccionado)
    }
  }

  const handleUploadSuccess = () => {
    // Recargar documentos del hijo seleccionado
    if (hijoSeleccionado) {
      fetchEducandoDocumentos(hijoSeleccionado)
    }
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
    <div className="space-y-5 md:space-y-8">
      {/* Header con saludo */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Hola, {userData?.nombre || user?.nombre || 'Familia'} 👋
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Bienvenido al portal de familias
          </p>
        </div>

        {/* Botón galería - icon-only en mobile, con texto en desktop */}
        <Button variant="outline" size="icon" asChild className="lg:hidden flex-shrink-0">
          <Link href="/familia/galeria" aria-label="Galería">
            <Camera className="h-5 w-5 text-purple-600" />
          </Link>
        </Button>
        <div className="hidden lg:flex">
          <QuickActionsGroup
            actions={[
              { icon: Camera, label: 'Galería', href: '/familia/galeria', color: 'text-purple-600' }
            ]}
          />
        </div>
      </div>

      {/* Mensajes del Monitor */}
      <MensajesMonitorCompacto maxMensajes={3} />

      {/* === LAYOUT MOBILE (< lg): Acordeón hijo+docs === */}
      <div className="lg:hidden space-y-5">
        {/* Calendario primero en mobile */}
        <CalendarioCompacto
          seccionId={hijoActual?.seccion_id}
          hijoSeleccionado={hijoSeleccionado}
        />

        {/* Mis Hijos con docs inline (acordeón) */}
        <div className="space-y-5">
          <h2 className="text-xl font-semibold">Mis Hijos</h2>
          <div className="space-y-3">
            {hijosConDocumentos.map((hijo) => (
              <div key={hijo.id}>
                <HijoCardCompacto
                  hijo={hijo}
                  selected={mobileExpandido === hijo.id}
                  onClick={() => {
                    const newId = mobileExpandido === hijo.id ? undefined : hijo.id
                    setMobileExpandido(newId)
                    if (newId) setHijoSeleccionado(newId)
                  }}
                />
                {/* Docs inline si este hijo está expandido */}
                {mobileExpandido === hijo.id && (
                  <div className="mt-2">
                    <DocumentosListaCompacta
                      hijo={hijo}
                      estructuraEducando={estructuraEducandoActual}
                      plantillas={plantillas}
                      loading={driveLoading}
                      onUploadDocumento={handleUploadDocumento}
                      onResubirDocumento={handleResubirDocumento}
                      onDownloadPlantilla={downloadPlantilla}
                      compact
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === LAYOUT DESKTOP (>= lg) === */}
      <div className="hidden lg:block space-y-8">
        {/* Mis Hijos primero en desktop */}
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">Mis Hijos</h2>
          <HijosListaCompacta
            hijos={hijosConDocumentos}
            hijoSeleccionado={hijoSeleccionado}
            onSelectHijo={setHijoSeleccionado}
          />
        </div>

        {/* Grid 2 columnas: Documentos + Calendario */}
        <div className="grid lg:grid-cols-2 gap-6">
          <DocumentosListaCompacta
            hijo={hijoActual}
            estructuraEducando={estructuraEducandoActual}
            plantillas={plantillas}
            loading={driveLoading}
            onUploadDocumento={handleUploadDocumento}
            onResubirDocumento={handleResubirDocumento}
            onDownloadPlantilla={downloadPlantilla}
          />
          <CalendarioCompacto
            seccionId={hijoActual?.seccion_id}
            hijoSeleccionado={hijoSeleccionado}
          />
        </div>
      </div>

      {/* Modal de subida de documentos */}
      {uploadTipoDocumento && hijoActual && (
        <DocumentoUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          educandoId={hijoActual.id}
          educandoNombre={`${hijoActual.nombre} ${hijoActual.apellidos}`}
          tipoDocumento={uploadTipoDocumento}
          onSuccess={handleUploadSuccess}
          plantillas={plantillas}
        />
      )}

      {/* Modal de resubida de documentos (nueva versión) */}
      <DocumentoResubirModal
        isOpen={resubirModalOpen}
        onClose={() => {
          setResubirModalOpen(false)
          setDocumentoParaResubir(null)
        }}
        documento={documentoParaResubir}
        onSuccess={handleResubirSuccess}
      />
    </div>
  )
}
