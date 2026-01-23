'use client'
import { getApiUrl } from '@/lib/api-utils'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  ArrowLeft,
  Clock,
  User,
  FileCheck,
  Search
} from "lucide-react"
import Link from "next/link"
import { useNotificacionesScouter, DocumentoPendiente } from "@/hooks/useNotificacionesScouter"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

// Colores por sección
const SECCION_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  'Castores': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800 border-orange-300' },
  'Manada': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  'Tropa': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  'Pioneros': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-800 border-red-300' },
  'Rutas': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100 text-green-800 border-green-300' },
}

const getSeccionColors = (seccion: string) => {
  return SECCION_COLORS[seccion] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800 border-gray-300' }
}

export default function DocumentosPendientesPage() {
  const {
    documentosPendientes,
    loading,
    aprobarDocumento,
    rechazarDocumento,
  } = useNotificacionesScouter()

  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<DocumentoPendiente | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [procesando, setProcesando] = useState(false)

  const API_URL = getApiUrl()

  // Filtrar documentos por búsqueda
  const filteredDocs = documentosPendientes.filter(doc => {
    const searchLower = searchTerm.toLowerCase()
    return (
      doc.educando_nombre.toLowerCase().includes(searchLower) ||
      doc.educando_apellidos.toLowerCase().includes(searchLower) ||
      doc.titulo.toLowerCase().includes(searchLower) ||
      doc.seccion_nombre?.toLowerCase().includes(searchLower)
    )
  })

  // Agrupar por sección
  const docsPorSeccion = filteredDocs.reduce((acc, doc) => {
    const seccion = doc.seccion_nombre || 'Sin sección'
    if (!acc[seccion]) {
      acc[seccion] = []
    }
    acc[seccion].push(doc)
    return acc
  }, {} as Record<string, DocumentoPendiente[]>)

  const handleOpenPreview = (doc: DocumentoPendiente) => {
    setSelectedDoc(doc)
    setShowPreviewModal(true)
  }

  const getPreviewUrl = (doc: DocumentoPendiente) => {
    if (doc.google_drive_file_id) {
      return `${API_URL}/api/drive/file/${doc.google_drive_file_id}/preview`
    }
    return doc.archivo_ruta
  }

  const handleAprobar = async () => {
    if (!selectedDoc) return

    setProcesando(true)
    try {
      await aprobarDocumento(selectedDoc.id)
      toast({
        title: "Documento aprobado",
        description: `El documento de ${selectedDoc.educando_nombre} ha sido aprobado correctamente.`,
      })
      setShowPreviewModal(false)
      setSelectedDoc(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aprobar el documento. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setProcesando(false)
    }
  }

  const handleRechazar = async () => {
    if (!selectedDoc || !motivoRechazo.trim()) return

    setProcesando(true)
    try {
      await rechazarDocumento(selectedDoc.id, motivoRechazo)
      toast({
        title: "Documento rechazado",
        description: `Se ha notificado a la familia sobre el rechazo del documento.`,
      })
      setShowRejectDialog(false)
      setShowPreviewModal(false)
      setMotivoRechazo('')
      setSelectedDoc(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo rechazar el documento. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/aula-virtual">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documentos Pendientes de Revisión</h1>
            <p className="text-muted-foreground">
              Revisa y aprueba los documentos subidos por las familias
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {documentosPendientes.length} pendiente{documentosPendientes.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, documento o sección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de documentos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando documentos pendientes...</p>
        </div>
      ) : documentosPendientes.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-medium">No hay documentos pendientes</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Todos los documentos han sido revisados. Cuando las familias suban nuevos documentos,
                aparecerán aquí para su aprobación.
              </p>
              <Button asChild variant="outline">
                <Link href="/aula-virtual">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver al inicio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(docsPorSeccion).map(([seccion, docs]) => {
            const colors = getSeccionColors(seccion)
            return (
              <div key={seccion} className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Badge className={`text-sm ${colors.badge}`}>
                    {seccion}
                  </Badge>
                  <span className="text-muted-foreground text-sm font-normal">
                    ({docs.length} documento{docs.length !== 1 ? 's' : ''})
                  </span>
                </h2>

                <div className="grid gap-4">
                  {docs.map((doc) => {
                    const docColors = getSeccionColors(doc.seccion_nombre || '')
                    return (
                      <Card key={doc.id} className={`overflow-hidden border ${docColors.border}`}>
                        <div className="flex items-stretch">
                          {/* Info del documento */}
                          <div className={`flex-1 p-4 ${docColors.bg}`}>
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${docColors.bg} border ${docColors.border} flex-shrink-0`}>
                                <FileCheck className={`h-6 w-6 ${docColors.text}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{doc.titulo}</h3>
                                  <Badge variant="outline" className={`${docColors.badge}`}>
                                    Pendiente
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                  <User className="h-4 w-4" />
                                  <span>{doc.educando_nombre} {doc.educando_apellidos}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    <span>{doc.archivo_nombre}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      Subido {formatDistanceToNow(new Date(doc.fecha_subida), {
                                        addSuffix: true,
                                        locale: es
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Solo botón Ver */}
                          <div className="flex items-center border-l bg-gray-50/50 px-4">
                            <Button
                              variant="outline"
                              className={`${docColors.text} border-current hover:${docColors.bg}`}
                              onClick={() => handleOpenPreview(doc)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver documento
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de preview con acciones */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{selectedDoc?.titulo}</DialogTitle>
            <DialogDescription>
              {selectedDoc?.educando_nombre} {selectedDoc?.educando_apellidos} - {selectedDoc?.seccion_nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-0">
            {selectedDoc && (
              selectedDoc.archivo_nombre?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                /* Visor de imagenes - ajustado al contenedor */
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={getPreviewUrl(selectedDoc)}
                    alt={selectedDoc.titulo}
                    className="max-w-full max-h-full object-contain rounded"
                  />
                </div>
              ) : (
                /* Visor de PDF/otros documentos */
                <iframe
                  src={getPreviewUrl(selectedDoc)}
                  className="w-full h-full rounded border"
                  title="Vista previa del documento"
                />
              )
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Cerrar
            </Button>
            <Button
              variant="default"
              onClick={handleAprobar}
              disabled={procesando}
              className="bg-green-600 hover:bg-green-700"
            >
              {procesando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Aprobar
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              disabled={procesando}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de rechazo */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar documento</DialogTitle>
            <DialogDescription>
              Indica el motivo por el cual el documento no es válido.
              La familia recibirá una notificación con este mensaje.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Documento:</strong> {selectedDoc?.titulo}
              </p>
              <p className="text-sm text-amber-800">
                <strong>Educando:</strong> {selectedDoc?.educando_nombre} {selectedDoc?.educando_apellidos}
              </p>
            </div>
            <Textarea
              placeholder="Escribe el motivo del rechazo..."
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setMotivoRechazo('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRechazar}
              disabled={!motivoRechazo.trim() || procesando}
            >
              {procesando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Rechazar documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
