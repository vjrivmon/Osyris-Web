'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FileText,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Camera,
  File,
  Search,
  Filter,
  Calendar,
  Eye,
  Archive,
  Settings,
  Bell
} from "lucide-react"
import { DocumentoFamilia } from '@/hooks/useDocumentosFamilia'
import { useFamiliaData } from '@/hooks/useFamiliaData'

interface DocumentosDashboardProps {
  documentos: DocumentoFamilia[] | null
  onUploadDocumento: () => void
  onVerDetalles: (documento: DocumentoFamilia) => void
  onEditarDocumento: (documento: DocumentoFamilia) => void
  onEliminarDocumento: (documento: DocumentoFamilia) => void
  onDescargarDocumento: (documento: DocumentoFamilia) => void
  loading?: boolean
}

export function DocumentosDashboard({
  documentos,
  onUploadDocumento,
  onVerDetalles,
  onEditarDocumento,
  onEliminarDocumento,
  onDescargarDocumento,
  loading = false
}: DocumentosDashboardProps) {
  const { hijos } = useFamiliaData()
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [searchQuery, setSearchQuery] = useState('')

  // Agrupar documentos por estado
  const documentosPorEstado = documentos ? {
    atencion_requerida: documentos.filter(d => d.estado === 'vencido'),
    vence_pronto: documentos.filter(d => d.estado === 'por_vencer'),
    al_dia: documentos.filter(d => d.estado === 'vigente'),
    pendientes: documentos.filter(d => d.estado === 'pendiente'),
    en_revision: documentos.filter(d => d.estado === 'en_revision')
  } : {
    atencion_requerida: [],
    vence_pronto: [],
    al_dia: [],
    pendientes: [],
    en_revision: []
  }

  // Calcular estadísticas
  const estadisticas = {
    total: documentos?.length || 0,
    criticos: documentosPorEstado.atencion_requerida.length,
    porVencer: documentosPorEstado.vence_pronto.length,
    completados: documentosPorEstado.al_dia.length,
    pendientes: documentosPorEstado.pendientes.length,
    revision: documentosPorEstado.en_revision.length,
    porcentajeCompletado: documentos?.length > 0
      ? Math.round((documentosPorEstado.al_dia.length / documentos.length) * 100)
      : 0
  }

  // Agrupar documentos por scout
  const documentosPorScout = hijos?.map(hijo => {
    const docsHijo = documentos?.filter(d => d.scoutId === hijo.id.toString()) || []
    return {
      scout: hijo,
      documentos: docsHijo,
      estado: docsHijo.length === 0 ? 'sin_documentos' :
              docsHijo.some(d => d.estado === 'vencido') ? 'critico' :
              docsHijo.some(d => d.estado === 'por_vencer') ? 'atencion' :
              docsHijo.some(d => d.estado === 'pendiente') ? 'incompleto' : 'completo'
    }
  }) || []

  // Filtrar documentos según búsqueda y estado
  const documentosFiltrados = documentos?.filter(doc => {
    const cumpleBusqueda = searchQuery === '' ||
      doc.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())

    const cumpleEstado = filtroEstado === 'todos' || doc.estado === filtroEstado

    return cumpleBusqueda && cumpleEstado
  }) || []

  const renderEstadoBadge = (estado: string) => {
    const config = {
      vencido: { color: 'destructive', icon: AlertTriangle, text: 'Vencido' },
      por_vencer: { color: 'secondary', icon: Clock, text: 'Vence Pronto' },
      vigente: { color: 'default', icon: CheckCircle, text: 'Al Día' },
      pendiente: { color: 'outline', icon: Upload, text: 'Pendiente' },
      en_revision: { color: 'secondary', icon: Archive, text: 'En Revisión' }
    }

    const { color, icon: Icon, text } = config[estado as keyof typeof config] || config.vigente

    return (
      <Badge variant={color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    )
  }

  const renderScoutStatus = (estado: string) => {
    const config = {
      critico: { color: 'destructive', text: 'Requiere Atención', icon: AlertTriangle },
      atencion: { color: 'secondary', text: 'Revisar Pronto', icon: Clock },
      incompleto: { color: 'outline', text: 'Incompleto', icon: Upload },
      completo: { color: 'default', text: 'Completo', icon: CheckCircle },
      sin_documentos: { color: 'outline', text: 'Sin Documentos', icon: File }
    }

    const { color, text, icon: Icon } = config[estado as keyof typeof config] || config.sin_documentos

    return (
      <Badge variant={color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones principales */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Centro de Documentos</h2>
          <p className="text-muted-foreground">
            Gestiona y supervisa toda la documentación de tus hijos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            Plantillas
          </Button>
          <Button onClick={onUploadDocumento}>
            <Upload className="h-4 w-4 mr-2" />
            Subir Documento
          </Button>
        </div>
      </div>

      {/* Alertas críticas */}
      {estadisticas.criticos > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Atención Requerida</AlertTitle>
          <AlertDescription className="text-red-700">
            Tienes {estadisticas.criticos} documento{estadisticas.criticos > 1 ? 's' : ''} vencido{estadisticas.criticos > 1 ? 's' : ''} que necesita{estadisticas.criticos > 1 ? 'n' : ''} acción inmediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
            <p className="text-xs text-muted-foreground">
              {hijos?.length || 0} scout{hijos?.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Al Día</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.completados}</div>
            <p className="text-xs text-muted-foreground">
              Vigentes y aprobados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requieren Atención</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{estadisticas.porVencer}</div>
            <p className="text-xs text-muted-foreground">
              Vencen en menos de 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas.pendientes}</div>
            <p className="text-xs text-muted-foreground">
              Por subir o aprobar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progreso general */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progreso General de Documentación</CardTitle>
          <CardDescription>
            Estado general de todos los documentos requeridos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completado</span>
              <span className="text-sm text-muted-foreground">{estadisticas.porcentajeCompletado}%</span>
            </div>
            <Progress value={estadisticas.porcentajeCompletado} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{estadisticas.completados} completados</span>
              <span>{estadisticas.total - estadisticas.completados} pendientes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filtroEstado === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroEstado('todos')}
          >
            Todos
          </Button>
          <Button
            variant={filtroEstado === 'vencido' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroEstado('vencido')}
          >
            Vencidos
          </Button>
          <Button
            variant={filtroEstado === 'por_vencer' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroEstado('por_vencer')}
          >
            Vencen Pronto
          </Button>
          <Button
            variant={filtroEstado === 'pendiente' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroEstado('pendiente')}
          >
            Pendientes
          </Button>
        </div>
      </div>

      {/* Documentos por Scout */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Documentos por Scout</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {documentosPorScout.map(({ scout, documentos, estado }) => (
            <Card key={scout.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{scout.nombre} {scout.apellidos}</CardTitle>
                    <CardDescription>
                      {scout.seccion} • {scout.edad} años
                    </CardDescription>
                  </div>
                  {renderScoutStatus(estado)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {documentos.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin documentos subidos</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Upload className="h-3 w-3 mr-1" />
                      Subir primero
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documentos.slice(0, 3).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{doc.titulo}</p>
                            {doc.fechaVencimiento && (
                              <p className="text-xs text-muted-foreground">
                                Vence: {doc.fechaVencimiento.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderEstadoBadge(doc.estado)}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onVerDetalles(doc)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {documentos.length > 3 && (
                      <Button size="sm" variant="outline" className="w-full">
                        Ver todos ({documentos.length} documentos)
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Secciones de documentos por estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atención Requerida */}
        {documentosPorEstado.atencion_requerida.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Atención Requerida ({documentosPorEstado.atencion_requerida.length})
              </CardTitle>
              <CardDescription className="text-red-700">
                Documentos vencidos que requieren acción inmediata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {documentosPorEstado.atencion_requerida.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">{doc.titulo}</p>
                      <p className="text-sm text-red-700">
                        Venció el {doc.fechaVencimiento?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => onUploadDocumento()}>
                      <Upload className="h-3 w-3 mr-1" />
                      Renovar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Vence Pronto */}
        {documentosPorEstado.vence_pronto.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Vence Pronto ({documentosPorEstado.vence_pronto.length})
              </CardTitle>
              <CardDescription className="text-orange-700">
                Documentos que vencen en menos de 30 días
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {documentosPorEstado.vence_pronto.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">{doc.titulo}</p>
                      <p className="text-sm text-orange-700">
                        Vence el {doc.fechaVencimiento?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onVerDetalles(doc)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" onClick={() => onUploadDocumento()}>
                      <Upload className="h-3 w-3 mr-1" />
                      Renovar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pendientes */}
        {documentosPorEstado.pendientes.length > 0 && (
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Pendientes ({documentosPorEstado.pendientes.length})
              </CardTitle>
              <CardDescription className="text-blue-700">
                Documentos por subir o en proceso de aprobación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {documentosPorEstado.pendientes.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{doc.titulo}</p>
                      <p className="text-sm text-blue-700">
                        {doc.estado === 'en_revision' ? 'En revisión' : 'Pendiente de subida'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {doc.estado === 'pendiente' && (
                      <Button size="sm" onClick={() => onUploadDocumento()}>
                        <Upload className="h-3 w-3 mr-1" />
                        Subir
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => onVerDetalles(doc)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Al Día */}
        {documentosPorEstado.al_dia.length > 0 && (
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Al Día ({documentosPorEstado.al_dia.length})
              </CardTitle>
              <CardDescription className="text-green-700">
                Documentos vigentes y aprobados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {documentosPorEstado.al_dia.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{doc.titulo}</p>
                      {doc.fechaVencimiento && (
                        <p className="text-sm text-green-700">
                          Vence: {doc.fechaVencimiento.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onDescargarDocumento(doc)}>
                      <Download className="h-3 w-3 mr-1" />
                      Descargar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onVerDetalles(doc)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
              {documentosPorEstado.al_dia.length > 5 && (
                <Button size="sm" variant="outline" className="w-full">
                  Ver todos ({documentosPorEstado.al_dia.length} documentos)
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Atajos para las operaciones más comunes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={onUploadDocumento}>
              <Upload className="h-6 w-6" />
              <span className="text-sm">Subir Documento</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => {}}>
              <Download className="h-6 w-6" />
              <span className="text-sm">Plantillas</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => {}}>
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Calendario</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => {}}>
              <Settings className="h-6 w-6" />
              <span className="text-sm">Configuración</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}