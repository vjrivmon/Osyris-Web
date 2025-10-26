'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Badge
} from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileCheck,
  FileX,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Search,
  Filter,
  RefreshCw,
  FileText,
  MessageSquare,
  Send
} from 'lucide-react'
import { useAdminFamiliares, type DocumentoFamiliar } from '@/hooks/useAdminFamiliares'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface AprobarDocumentosProps {
  onVerFamilias?: () => void
}

export function AprobarDocumentosPanel({ onVerFamilias }: AprobarDocumentosProps) {
  const [selectedDocumento, setSelectedDocumento] = useState<DocumentoFamiliar | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewAction, setReviewAction] = useState<'APROBADO' | 'RECHAZADO'>('APROBADO')
  const [reviewComments, setReviewComments] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('all')
  const [tipoFilter, setTipoFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('pendientes')

  const {
    loading,
    documentosPendientes,
    aprobarDocumento,
    rechazarDocumento,
    cargarDocumentosPendientes
  } = useAdminFamiliares()

  const { toast } = useToast()

  // Cargar documentos al montar el componente
  useEffect(() => {
    cargarDocumentosPendientes()
  }, [])

  const handlePreview = (documento: DocumentoFamiliar) => {
    setSelectedDocumento(documento)
    setShowPreviewDialog(true)
  }

  const handleReview = (documento: DocumentoFamiliar, action: 'APROBADO' | 'RECHAZADO') => {
    setSelectedDocumento(documento)
    setReviewAction(action)
    setReviewComments('')
    setShowReviewDialog(true)
  }

  const submitReview = async () => {
    if (!selectedDocumento) return

    let success = false
    if (reviewAction === 'APROBADO') {
      success = await aprobarDocumento(selectedDocumento.id, reviewComments)
    } else {
      if (!reviewComments.trim()) {
        toast({
          title: "Error",
          description: "Debes añadir comentarios para rechazar un documento",
          variant: "destructive"
        })
        return
      }
      success = await rechazarDocumento(selectedDocumento.id, reviewComments)
    }

    if (success) {
      setShowReviewDialog(false)
      setSelectedDocumento(null)
      setReviewComments('')
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDIENTE: "outline",
      APROBADO: "default",
      RECHAZADO: "destructive"
    }

    const colors: Record<string, string> = {
      PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      APROBADO: "bg-green-100 text-green-800 border-green-200",
      RECHAZADO: "bg-red-100 text-red-800 border-red-200"
    }

    const icons: Record<string, React.ReactNode> = {
      PENDIENTE: <Clock className="h-3 w-3" />,
      APROBADO: <CheckCircle className="h-3 w-3" />,
      RECHAZADO: <AlertCircle className="h-3 w-3" />
    }

    return (
      <Badge
        variant={variants[estado] || "secondary"}
        className={cn("flex items-center gap-1", colors[estado])}
      >
        {icons[estado]}
        <span>{estado}</span>
      </Badge>
    )
  }

  const getTipoDocumentoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      'AUTORIZACION': 'bg-blue-100 text-blue-800',
      'DNI': 'bg-purple-100 text-purple-800',
      'FOTO': 'bg-orange-100 text-orange-800',
      'CERTIFICADO_MEDICO': 'bg-red-100 text-red-800',
      'OTRO': 'bg-gray-100 text-gray-800'
    }

    return (
      <Badge variant="outline" className={cn("text-xs", colors[tipo] || colors.OTRO)}>
        {tipo.replace('_', ' ')}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysSinceUpload = (uploadDate: string) => {
    const now = new Date()
    const upload = new Date(uploadDate)
    const diffTime = Math.abs(now.getTime() - upload.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDaysColor = (days: number) => {
    if (days > 7) return 'text-red-600'
    if (days > 3) return 'text-yellow-600'
    return 'text-green-600'
  }

  const documentosFiltrados = documentosPendientes.filter(doc => {
    const matchesSearch = searchTerm === '' ||
      doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.familiar.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.familiar.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.familiar.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = estadoFilter === 'all' || doc.estado === estadoFilter
    const matchesTipo = tipoFilter === 'all' || doc.tipo === tipoFilter

    return matchesSearch && matchesEstado && matchesTipo
  })

  const documentosPorEstado = {
    pendientes: documentosFiltrados.filter(d => d.estado === 'PENDIENTE'),
    aprobados: documentosFiltrados.filter(d => d.estado === 'APROBADO'),
    rechazados: documentosFiltrados.filter(d => d.estado === 'RECHAZADO')
  }

  const estadisticas = {
    total: documentosFiltrados.length,
    pendientes: documentosPorEstado.pendientes.length,
    aprobados: documentosPorEstado.aprobados.length,
    rechazados: documentosPorEstado.rechazados.length,
    urgentes: documentosPorEstado.pendientes.filter(d => getDaysSinceUpload(d.fechaSubida) > 7).length
  }

  return (
    <div className="space-y-6">
      {/* Cabecera y estadísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gestión de Documentos Familiares
              </CardTitle>
              <CardDescription>
                Revisa y aprueba los documentos subidos por los familiares
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => cargarDocumentosPendientes()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              {onVerFamilias && (
                <Button variant="outline" onClick={onVerFamilias}>
                  Ver Familias
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {estadisticas.total}
              </div>
              <div className="text-sm text-blue-600">Total Documentos</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {estadisticas.pendientes}
              </div>
              <div className="text-sm text-yellow-600">Pendientes</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {estadisticas.aprobados}
              </div>
              <div className="text-sm text-green-600">Aprobados</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {estadisticas.rechazados}
              </div>
              <div className="text-sm text-red-600">Rechazados</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {estadisticas.urgentes}
              </div>
              <div className="text-sm text-orange-600">Urgentes (+7 días)</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, familiar o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="APROBADO">Aprobado</SelectItem>
                <SelectItem value="RECHAZADO">Rechazado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="AUTORIZACION">Autorización</SelectItem>
                <SelectItem value="DNI">DNI</SelectItem>
                <SelectItem value="FOTO">Foto</SelectItem>
                <SelectItem value="CERTIFICADO_MEDICO">Certificado Médico</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setEstadoFilter('all')
              setTipoFilter('all')
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de documentos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendientes" className="flex items-center gap-2">
            Pendientes
            {estadisticas.pendientes > 0 && (
              <Badge variant="destructive" className="text-xs">
                {estadisticas.pendientes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="aprobados" className="flex items-center gap-2">
            Aprobados
            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
              {estadisticas.aprobados}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rechazados" className="flex items-center gap-2">
            Rechazados
            <Badge variant="default" className="text-xs bg-red-100 text-red-800">
              {estadisticas.rechazados}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4">
          <DocumentosTable
            documentos={documentosPorEstado.pendientes}
            loading={loading}
            onPreview={handlePreview}
            onReview={(doc) => handleReview(doc, 'APROBADO')}
            onReject={(doc) => handleReview(doc, 'RECHAZADO')}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="aprobados" className="space-y-4">
          <DocumentosTable
            documentos={documentosPorEstado.aprobados}
            loading={loading}
            onPreview={handlePreview}
            showActions={false}
          />
        </TabsContent>

        <TabsContent value="rechazados" className="space-y-4">
          <DocumentosTable
            documentos={documentosPorEstado.rechazados}
            loading={loading}
            onPreview={handlePreview}
            showActions={false}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog de vista previa */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista previa del documento
            </DialogTitle>
            <DialogDescription>
              {selectedDocumento?.nombre}
            </DialogDescription>
          </DialogHeader>
          {selectedDocumento && (
            <div className="space-y-4">
              {/* Información del documento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información del documento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Nombre</Label>
                      <p className="text-sm mt-1">{selectedDocumento.nombre}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tipo</Label>
                      <div className="mt-1">
                        {getTipoDocumentoBadge(selectedDocumento.tipo)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Estado</Label>
                      <div className="mt-1">
                        {getEstadoBadge(selectedDocumento.estado)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Fecha de subida</Label>
                      <p className="text-sm mt-1">{formatDate(selectedDocumento.fechaSubida)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Familiar</Label>
                      <p className="text-sm mt-1">
                        {selectedDocumento.familiar.nombre} {selectedDocumento.familiar.apellidos}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedDocumento.familiar.email}</p>
                    </div>
                    {selectedDocumento.fechaRevision && (
                      <div>
                        <Label className="text-sm font-medium">Fecha de revisión</Label>
                        <p className="text-sm mt-1">{formatDate(selectedDocumento.fechaRevision)}</p>
                      </div>
                    )}
                    {selectedDocumento.revisor && (
                      <div>
                        <Label className="text-sm font-medium">Revisado por</Label>
                        <p className="text-sm mt-1">{selectedDocumento.revisor}</p>
                      </div>
                    )}
                  </div>
                  {selectedDocumento.comentarios && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Comentarios</Label>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">
                        {selectedDocumento.comentarios}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vista previa del archivo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vista previa del archivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Vista previa no disponible</p>
                      <Button variant="outline" asChild>
                        <a href={selectedDocumento.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar documento
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de revisión */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'APROBADO' ? (
                <>
                  <FileCheck className="h-5 w-5 text-green-600" />
                  Aprobar documento
                </>
              ) : (
                <>
                  <FileX className="h-5 w-5 text-red-600" />
                  Rechazar documento
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedDocumento?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comments">Comentarios</Label>
              <Textarea
                id="comments"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder={
                  reviewAction === 'APROBADO'
                    ? "Añade comentarios opcionales sobre la aprobación..."
                    : "Debes añadir comentarios explicando el motivo del rechazo..."
                }
                rows={4}
              />
              {reviewAction === 'RECHAZADO' && (
                <p className="text-xs text-red-600 mt-1">
                  Los comentarios son obligatorios para rechazar un documento
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={submitReview}
              disabled={loading || (reviewAction === 'RECHAZADO' && !reviewComments.trim())}
              className={reviewAction === 'APROBADO' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  {reviewAction === 'APROBADO' ? (
                    <>
                      <FileCheck className="h-4 w-4 mr-2" />
                      Aprobar
                    </>
                  ) : (
                    <>
                      <FileX className="h-4 w-4 mr-2" />
                      Rechazar
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface DocumentosTableProps {
  documentos: DocumentoFamiliar[]
  loading: boolean
  onPreview?: (documento: DocumentoFamiliar) => void
  onReview?: (documento: DocumentoFamiliar) => void
  onReject?: (documento: DocumentoFamiliar) => void
  showActions?: boolean
}

function DocumentosTable({
  documentos,
  loading,
  onPreview,
  onReview,
  onReject,
  showActions = false
}: DocumentosTableProps) {
  const getDaysSinceUpload = (uploadDate: string) => {
    const now = new Date()
    const upload = new Date(uploadDate)
    const diffTime = Math.abs(now.getTime() - upload.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDaysColor = (days: number) => {
    if (days > 7) return 'text-red-600'
    if (days > 3) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getTipoDocumentoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      'AUTORIZACION': 'bg-blue-100 text-blue-800',
      'DNI': 'bg-purple-100 text-purple-800',
      'FOTO': 'bg-orange-100 text-orange-800',
      'CERTIFICADO_MEDICO': 'bg-red-100 text-red-800',
      'OTRO': 'bg-gray-100 text-gray-800'
    }

    return (
      <Badge variant="outline" className={cn("text-xs", colors[tipo] || colors.OTRO)}>
        {tipo.replace('_', ' ')}
      </Badge>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Familiar</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Antigüedad</TableHead>
                <TableHead>Fecha Subida</TableHead>
                {showActions && <TableHead className="w-[200px]">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Cargando documentos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : documentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay documentos en esta categoría</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                documentos.map((documento) => {
                  const daysSinceUpload = getDaysSinceUpload(documento.fechaSubida)
                  return (
                    <TableRow key={documento.id}>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="font-medium truncate">{documento.nombre}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-blue-600"
                            onClick={() => onPreview?.(documento)}
                          >
                            Ver documento
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {documento.familiar.nombre} {documento.familiar.apellidos}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {documento.familiar.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTipoDocumentoBadge(documento.tipo)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            documento.estado === 'PENDIENTE' ? 'outline' :
                            documento.estado === 'APROBADO' ? 'default' : 'destructive'
                          }
                        >
                          {documento.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={cn("text-sm font-medium", getDaysColor(daysSinceUpload))}>
                          {daysSinceUpload} días
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(documento.fechaSubida).toLocaleDateString('es-ES')}
                        </div>
                      </TableCell>
                      {showActions && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onPreview?.(documento)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {documento.estado === 'PENDIENTE' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onReview?.(documento)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <FileCheck className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onReject?.(documento)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <FileX className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}