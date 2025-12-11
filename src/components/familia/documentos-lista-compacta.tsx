'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  FileText,
  Heart,
  Shield,
  Syringe,
  CreditCard,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  FileCheck,
  Loader2,
  Clock
} from "lucide-react"
import { ScoutHijo, TipoDocumento, DOCUMENTO_TIPO_CONFIG } from "@/types/familia"
import { EstructuraEducando, Plantilla } from "@/hooks/useGoogleDrive"
import { DocumentoViewerModal } from "./documento-viewer-modal"

interface DocumentosListaCompactaProps {
  hijo?: ScoutHijo
  estructuraEducando?: EstructuraEducando | null
  plantillas?: Plantilla[]
  loading?: boolean
  onUploadDocumento?: (tipo: TipoDocumento) => void
  onResubirDocumento?: (tipo: TipoDocumento, documentoId?: number) => void
  onDownloadPlantilla?: (fileId: string, fileName: string) => void
  compact?: boolean
  className?: string
}

// Iconos por tipo de documento
const getIconForTipo = (tipo: string) => {
  switch (tipo) {
    case 'ficha_inscripcion':
      return <FileText className="h-4 w-4 text-gray-400" />
    case 'ficha_sanitaria':
      return <Heart className="h-4 w-4 text-gray-400" />
    case 'sip':
      return <Shield className="h-4 w-4 text-gray-400" />
    case 'cartilla_vacunacion':
    case 'vacunas':
      return <Syringe className="h-4 w-4 text-gray-400" />
    case 'dni_padre_madre':
      return <CreditCard className="h-4 w-4 text-gray-400" />
    case 'regresar_solo':
      return <FileText className="h-4 w-4 text-gray-400" />  // DOC08
    case 'autorizacion_whatsapp':
      return <FileText className="h-4 w-4 text-gray-400" />  // DOC09
    default:
      return <FileText className="h-4 w-4 text-gray-400" />
  }
}

export function DocumentosListaCompacta({
  hijo,
  estructuraEducando,
  plantillas = [],
  loading = false,
  onUploadDocumento,
  onResubirDocumento,
  onDownloadPlantilla,
  compact = false,
  className
}: DocumentosListaCompactaProps) {
  const [verDetalles, setVerDetalles] = useState(!compact)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<{ name: string; webViewLink?: string } | null>(null)
  const [plantillasModalOpen, setPlantillasModalOpen] = useState(false)
  const [plantillasDescargadas, setPlantillasDescargadas] = useState<Set<string>>(new Set())

  // Cargar plantillas descargadas desde localStorage al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('plantillas_descargadas')
      if (saved) {
        try {
          setPlantillasDescargadas(new Set(JSON.parse(saved)))
        } catch {
          // Si hay error al parsear, ignorar
        }
      }
    }
  }, [])

  // Marcar plantilla como descargada
  const marcarPlantillaDescargada = (tipoDocumento: string) => {
    const nuevas = new Set(plantillasDescargadas)
    nuevas.add(tipoDocumento)
    setPlantillasDescargadas(nuevas)
    if (typeof window !== 'undefined') {
      localStorage.setItem('plantillas_descargadas', JSON.stringify([...nuevas]))
    }
  }

  // Nombres amigables para las plantillas
  const getNombrePlantilla = (tipo: string): string => {
    switch (tipo) {
      case 'ficha_inscripcion':
        return 'Ficha de Inscripción'
      case 'ficha_sanitaria':
        return 'Ficha Sanitaria'
      case 'regresar_solo':
        return 'Autorización Regresar Solo'
      case 'autorizacion_whatsapp':
        return 'Autorización Grupos WhatsApp'
      default:
        return 'Documento'
    }
  }

  // Descripciones de cada tipo de plantilla
  const getDescripcionPlantilla = (tipo: string): string => {
    switch (tipo) {
      case 'ficha_inscripcion':
        return 'Formulario de inscripción al grupo scout'
      case 'ficha_sanitaria':
        return 'Información médica y de salud del educando'
      case 'regresar_solo':
        return 'Autorización para que el educando regrese solo a casa'
      case 'autorizacion_whatsapp':
        return 'Consentimiento para grupos de WhatsApp'
      default:
        return 'Documento requerido'
    }
  }

  // Si no hay hijo seleccionado
  if (!hijo) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documentos</span>
          </CardTitle>
          <CardDescription>
            Selecciona un hijo para ver sus documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-8">
            <div className="p-4 rounded-full bg-gray-100">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-700">No hay hijo seleccionado</p>
              <p className="text-sm text-muted-foreground">
                Haz clic en una tarjeta de hijo para ver sus documentos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Usar datos de Drive si están disponibles
  const status = estructuraEducando?.status
  const resumen = estructuraEducando?.resumen

  // Si está cargando
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documentos de {hijo.nombre}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
            <p className="text-sm text-muted-foreground">Cargando documentos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calcular estadísticas desde datos reales
  const totalDocumentos = resumen?.total || 0
  const documentosCompletos = resumen?.completos || 0
  const documentosFaltantes = resumen?.faltantes || 0
  const progreso = totalDocumentos > 0 ? Math.round((documentosCompletos / totalDocumentos) * 100) : 0

  // Obtener lista de documentos desde status
  const documentosList = status ? Object.entries(status) : []

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Documentos de {hijo.nombre}</span>
            </CardTitle>
            <CardDescription className="mt-1">
              {documentosCompletos}/{totalDocumentos} documentos completos
            </CardDescription>
          </div>

          {/* Botón Plantillas - abre modal */}
          {plantillas && plantillas.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlantillasModalOpen(true)}
              className="border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Plantillas
            </Button>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso general</span>
            <span className="text-sm font-medium text-muted-foreground">{progreso}%</span>
          </div>
          <Progress value={progreso} className="h-2" />
        </div>

        {/* Estadísticas */}
        <div className="flex items-center gap-6 mt-5 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">{documentosCompletos} completos</span>
          </div>
          {documentosFaltantes > 0 && (
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-red-500" />
              <span className="text-red-600">{documentosFaltantes} faltan</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Alerta si faltan documentos obligatorios */}
        {documentosFaltantes > 0 && (
          <Alert variant="default" className="mb-6 border-red-200 bg-red-50/50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-700">
              {documentosFaltantes} documento{documentosFaltantes > 1 ? 's obligatorios' : ' obligatorio'} pendiente{documentosFaltantes > 1 ? 's' : ''} de subir
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de documentos desde Drive */}
        <div className="space-y-3">
          {documentosList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se pudieron cargar los documentos</p>
              <p className="text-sm">Intenta recargar la página</p>
            </div>
          ) : (
            // ✅ Mostrar TODOS los documentos que aplican al educando (obligatorios y opcionales por edad)
            // El backend ya filtra DOC08/DOC09 según la edad - si aparecen aquí es porque aplican
            documentosList
              .map(([tipo, doc]) => {
                // Estados: 'subido' = aprobado/verde, 'pendiente_revision' = amarillo, otro = faltante/rojo
                const estaSubido = doc.estado === 'subido'
                const enRevision = doc.estado === 'pendiente_revision'
                const tienDocumento = estaSubido || enRevision
                // Determinar si el documento es obligatorio
                const esObligatorio = DOCUMENTO_TIPO_CONFIG[tipo as keyof typeof DOCUMENTO_TIPO_CONFIG]?.requerido ?? false

                // Determinar estilos según estado
                const getEstadoStyles = () => {
                  if (estaSubido) {
                    return {
                      border: 'border-green-200 bg-green-50/30',
                      iconBg: 'bg-green-100',
                      icon: <FileCheck className="h-4 w-4 text-green-600" />,
                      text: 'text-green-600',
                      label: 'Documento aprobado'
                    }
                  }
                  if (enRevision) {
                    return {
                      border: 'border-amber-200 bg-amber-50/30',
                      iconBg: 'bg-amber-100',
                      icon: <Clock className="h-4 w-4 text-amber-600" />,
                      text: 'text-amber-600',
                      label: 'En revisión'
                    }
                  }
                  return {
                    border: 'border-gray-200 hover:border-gray-300',
                    iconBg: 'bg-gray-50',
                    icon: getIconForTipo(tipo),
                    text: 'text-red-600',
                    label: 'Documento faltante'
                  }
                }

                const estilos = getEstadoStyles()

                return (
                  <div
                    key={tipo}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${estilos.border}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${estilos.iconBg}`}>
                        {estilos.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-700">{doc.nombre}{esObligatorio && '*'}</p>
                        <p className={`text-xs font-medium flex items-center gap-1 ${estilos.text}`}>
                          {estaSubido && <CheckCircle className="h-3 w-3" />}
                          {enRevision && <Clock className="h-3 w-3" />}
                          {!tienDocumento && <AlertTriangle className="h-3 w-3" />}
                          {estilos.label}
                        </p>
                        {enRevision && (
                          <p className="text-xs text-muted-foreground mt-1">
                            El kraal de sección está revisando el documento
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón ver documento si está subido o en revisión */}
                      {tienDocumento && doc.archivo?.webViewLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDoc({ name: doc.archivo?.name || doc.nombre, webViewLink: doc.archivo?.webViewLink })
                            setModalOpen(true)
                          }}
                          className={estaSubido ? "border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700" : "border-amber-500 text-amber-600 hover:bg-amber-50 hover:border-amber-600"}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      )}

                      {/* Botón RESUBIR documento - para documentos ya subidos/aprobados */}
                      {estaSubido && onResubirDocumento && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-indigo-700 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-800"
                          onClick={() => onResubirDocumento(tipo as TipoDocumento, doc.archivo?.id ? parseInt(doc.archivo.id) : undefined)}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Subir
                        </Button>
                      )}

                      {/* Botón subir - solo si no tiene documento */}
                      {!tienDocumento && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUploadDocumento?.(tipo as TipoDocumento)}
                          className="border-indigo-700 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-800"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Subir
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
          )}
        </div>

        {/* Información adicional - solo para educandos >= 14 años (Pioneros/Rutas) que ven documentos opcionales */}
        {!compact && hijo && hijo.edad >= 14 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600 space-y-1">
                <p>Los documentos marcados con (*) son obligatorios</p>
                <p>Los documentos sin asterisco son opcionales</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal para ver documentos */}
        <DocumentoViewerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          documento={selectedDoc}
        />

        {/* Modal de Plantillas */}
        <Dialog open={plantillasModalOpen} onOpenChange={setPlantillasModalOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-amber-600" />
                Plantillas Disponibles
              </DialogTitle>
              <DialogDescription>
                Descarga las plantillas, rellénalas y súbelas completadas
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 mt-6">
              {plantillas?.filter(p => {
                // Solo mostrar plantillas de documentos que aplican a este educando
                // El backend ya filtra DOC08/DOC09 según la edad del educando
                return documentosList.some(([tipo]) => tipo === p.tipoDocumento)
              }).map((plantilla) => {
                const yaDescargada = plantillasDescargadas.has(plantilla.tipoDocumento)
                return (
                  <div
                    key={plantilla.id}
                    className={`flex items-center justify-between p-5 rounded-xl border transition-colors ${
                      yaDescargada
                        ? 'bg-green-50/50 border-green-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-1 mr-6">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-base">{getNombrePlantilla(plantilla.tipoDocumento)}</p>
                        {yaDescargada && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                            <CheckCircle className="h-3 w-3" />
                            Descargada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {getDescripcionPlantilla(plantilla.tipoDocumento)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        onDownloadPlantilla?.(plantilla.id, plantilla.name)
                        marcarPlantillaDescargada(plantilla.tipoDocumento)
                      }}
                      className="border-amber-500 text-amber-600 hover:bg-amber-50 flex-shrink-0 px-4 py-2"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {yaDescargada ? 'Descargar de nuevo' : 'Descargar'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
