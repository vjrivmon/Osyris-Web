'use client'
import { getApiUrl } from '@/lib/api-utils'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface DocumentoPendiente {
  id: number
  scout_id: number
  scout_nombre: string
  scout_apellidos: string
  seccion_nombre: string
  seccion_id: number
  familiar_nombre: string
  familiar_apellidos: string
  tipo_documento: string
  titulo: string
  archivo_ruta: string
  fecha_subida: string
  estado: string
}

const API_BASE_URL = getApiUrl()

export default function DocumentosPendientesPage() {
  const { token } = useAuth()
  const [documentos, setDocumentos] = useState<DocumentoPendiente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroSeccion, setFiltroSeccion] = useState<string>('todas')
  const [busqueda, setBusqueda] = useState('')

  // Modal de rechazo
  const [modalRechazo, setModalRechazo] = useState<{
    open: boolean
    documento: DocumentoPendiente | null
  }>({ open: false, documento: null })
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [procesando, setProcesando] = useState(false)

  const fetchDocumentos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/drive/documentos/pendientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar documentos')
      }

      const data = await response.json()
      setDocumentos(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchDocumentos()
    }
  }, [token, fetchDocumentos])

  const handleAprobar = async (documento: DocumentoPendiente) => {
    setProcesando(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/drive/documento/${documento.id}/aprobar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al aprobar documento')
      }

      // Actualizar lista
      await fetchDocumentos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar')
    } finally {
      setProcesando(false)
    }
  }

  const handleRechazar = async () => {
    if (!modalRechazo.documento || !motivoRechazo.trim()) return

    setProcesando(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/drive/documento/${modalRechazo.documento.id}/rechazar`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ motivo: motivoRechazo })
        }
      )

      if (!response.ok) {
        throw new Error('Error al rechazar documento')
      }

      // Cerrar modal y actualizar lista
      setModalRechazo({ open: false, documento: null })
      setMotivoRechazo('')
      await fetchDocumentos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar')
    } finally {
      setProcesando(false)
    }
  }

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    const cumpleFiltroSeccion = filtroSeccion === 'todas' ||
      doc.seccion_id.toString() === filtroSeccion
    const cumpleBusqueda = busqueda === '' ||
      `${doc.scout_nombre} ${doc.scout_apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.titulo.toLowerCase().includes(busqueda.toLowerCase())

    return cumpleFiltroSeccion && cumpleBusqueda
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documentos Pendientes de Revisión</h1>
          <p className="text-muted-foreground">
            Revisa y aprueba los documentos subidos por las familias
          </p>
        </div>
        <Button onClick={fetchDocumentos} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por educando o tipo de documento..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filtroSeccion} onValueChange={setFiltroSeccion}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las secciones</SelectItem>
                  <SelectItem value="1">Castores</SelectItem>
                  <SelectItem value="2">Manada</SelectItem>
                  <SelectItem value="3">Tropa</SelectItem>
                  <SelectItem value="4">Pioneros</SelectItem>
                  <SelectItem value="5">Rutas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Pendientes
            {documentosFiltrados.length > 0 && (
              <Badge variant="secondary">{documentosFiltrados.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Documentos subidos por familias esperando aprobación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documentosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">No hay documentos pendientes</h3>
              <p className="text-muted-foreground">
                Todos los documentos han sido revisados
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Educando</TableHead>
                    <TableHead>Sección</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Subido por</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentosFiltrados.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        {doc.scout_nombre} {doc.scout_apellidos}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.seccion_nombre}</Badge>
                      </TableCell>
                      <TableCell>{doc.titulo}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.familiar_nombre} {doc.familiar_apellidos}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(doc.fecha_subida)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {doc.archivo_ruta && (
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                            >
                              <a href={doc.archivo_ruta} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleAprobar(doc)}
                            disabled={procesando}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setModalRechazo({ open: true, documento: doc })}
                            disabled={procesando}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de rechazo */}
      <Dialog
        open={modalRechazo.open}
        onOpenChange={(open) => {
          if (!open) {
            setModalRechazo({ open: false, documento: null })
            setMotivoRechazo('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Documento</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo para que la familia pueda corregir el documento.
            </DialogDescription>
          </DialogHeader>

          {modalRechazo.documento && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{modalRechazo.documento.titulo}</p>
                <p className="text-sm text-muted-foreground">
                  {modalRechazo.documento.scout_nombre} {modalRechazo.documento.scout_apellidos}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Motivo del rechazo *
                </label>
                <Textarea
                  placeholder="Ej: El documento está incompleto, falta firmar la página 2..."
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalRechazo({ open: false, documento: null })}
              disabled={procesando}
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
