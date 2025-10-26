'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  File,
  Archive,
  Share2,
  Star,
  History,
  Shield,
  Camera,
  User,
  Tag,
  ExternalLink
} from "lucide-react"
import { DocumentoFamilia } from '@/hooks/useDocumentosFamilia'
import { useFamiliaData } from '@/hooks/useFamiliaData'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface DocumentoCardProps {
  documento: DocumentoFamilia
  onView: (documento: DocumentoFamilia) => void
  onEdit: (documento: DocumentoFamilia) => void
  onDelete: (documento: DocumentoFamilia) => void
  onDownload: (documento: DocumentoFamilia) => void
  onShare?: (documento: DocumentoFamilia) => void
  onDuplicate?: (documento: DocumentoFamilia) => void
  onRenew?: (documento: DocumentoFamilia) => void
  showScoutInfo?: boolean
  compact?: boolean
}

export function DocumentoCard({
  documento,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  onDuplicate,
  onRenew,
  showScoutInfo = true,
  compact = false
}: DocumentoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { hijos } = useFamiliaData()

  // Obtener información del scout
  const scout = hijos?.find(h => h.id.toString() === documento.scoutId)

  // Configuración de tipos de documento
  const tipoDocumentoConfig = {
    autorizacion_medica: {
      icon: Shield,
      color: 'red',
      label: 'Autorización Médica',
      description: 'Permiso para atención médica'
    },
    seguro_accidentes: {
      icon: Shield,
      color: 'blue',
      label: 'Seguro de Accidentes',
      description: 'Póliza de seguros'
    },
    autorizacion_imagen: {
      icon: Camera,
      color: 'purple',
      label: 'Autorización de Imagen',
      description: 'Uso de fotografías'
    },
    autorizacion_transporte: {
      icon: File,
      color: 'orange',
      label: 'Autorización Transporte',
      description: 'Permiso de transporte'
    },
    ficha_alergias: {
      icon: AlertTriangle,
      color: 'yellow',
      label: 'Ficha de Alergias',
      description: 'Información médica'
    },
    informe_medico: {
      icon: FileText,
      color: 'green',
      label: 'Informe Médico',
      description: 'Reporte médico'
    },
    inscripcion: {
      icon: File,
      color: 'blue',
      label: 'Ficha de Inscripción',
      description: 'Formulario de inscripción'
    },
    dni: {
      icon: User,
      color: 'gray',
      label: 'Copia DNI',
      description: 'Documento de identidad'
    },
    foto_carnet: {
      icon: Camera,
      color: 'pink',
      label: 'Foto Carnet',
      description: 'Fotografía reciente'
    },
    otro: {
      icon: File,
      color: 'gray',
      label: 'Otro Documento',
      description: 'Documento adicional'
    }
  }

  const config = tipoDocumentoConfig[documento.tipoDocumento] || tipoDocumentoConfig.otro
  const Icon = config.icon

  // Configuración de estados
  const estadoConfig = {
    vigente: {
      color: 'default',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: CheckCircle,
      label: 'Vigente'
    },
    por_vencer: {
      color: 'secondary',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      icon: Clock,
      label: 'Vence Pronto'
    },
    vencido: {
      color: 'destructive',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      icon: AlertTriangle,
      label: 'Vencido'
    },
    pendiente: {
      color: 'outline',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: Upload,
      label: 'Pendiente'
    },
    en_revision: {
      color: 'secondary',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      icon: Archive,
      label: 'En Revisión'
    }
  }

  const estado = estadoConfig[documento.estado] || estadoConfig.pendiente
  const EstadoIcon = estado.icon

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Formatear fecha relativa
  const formatRelativeDate = (date: Date): string => {
    try {
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: es
      })
    } catch {
      return date.toLocaleDateString()
    }
  }

  // Obtener color del icono según tipo
  const getIconColor = (color: string) => {
    const colors = {
      red: 'text-red-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      pink: 'text-pink-600',
      gray: 'text-gray-600'
    }
    return colors[color as keyof typeof colors] || 'text-gray-600'
  }

  // Manejar eliminación
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(documento)
    } finally {
      setIsDeleting(false)
    }
  }

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${estado.borderColor} ${estado.bgColor}`}>
        <div className="flex items-center space-x-3">
          <Icon className={`h-5 w-5 ${getIconColor(config.color)}`} />
          <div>
            <p className="font-medium text-sm">{documento.titulo}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(documento.tamañoArchivo)} • {formatRelativeDate(documento.fechaSubida)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={estado.color as any} className="flex items-center gap-1">
            <EstadoIcon className="h-3 w-3" />
            {estado.label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(documento)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(documento)}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(documento)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente el documento "{documento.titulo}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <Card className={`transition-all hover:shadow-md ${estado.borderColor} ${estado.bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg bg-white ${estado.borderColor}`}>
              <Icon className={`h-5 w-5 ${getIconColor(config.color)}`} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base leading-tight">{documento.titulo}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {config.description}
              </CardDescription>
              {showScoutInfo && scout && (
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3 mr-1" />
                  {scout.nombre} {scout.apellidos}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={estado.color as any} className="flex items-center gap-1">
              <EstadoIcon className="h-3 w-3" />
              {estado.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(documento)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver documento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(documento)}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </DropdownMenuItem>
                {onShare && (
                  <DropdownMenuItem onClick={() => onShare(documento)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(documento)}>
                    <File className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(documento)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar información
                </DropdownMenuItem>
                {(documento.estado === 'vencido' || documento.estado === 'por_vencer') && onRenew && (
                  <DropdownMenuItem onClick={() => onRenew(documento)}>
                    <History className="h-4 w-4 mr-2" />
                    Renovar documento
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el documento "{documento.titulo}".
                        {showScoutInfo && scout && (
                          <> Correspondiente a {scout.nombre} {scout.apellidos}.</>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Información del archivo */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-muted-foreground">
            <span className="flex items-center">
              <File className="h-3 w-3 mr-1" />
              {formatFileSize(documento.tamañoArchivo)}
            </span>
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatRelativeDate(documento.fechaSubida)}
            </span>
          </div>
          {documento.version > 1 && (
            <Badge variant="outline" className="text-xs">
              v{documento.version}
            </Badge>
          )}
        </div>

        {/* Información de vencimiento */}
        {documento.fechaVencimiento && (
          <div className={`p-2 rounded ${estado.bgColor} ${estado.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className={`h-4 w-4 ${estado.textColor}`} />
                <span className={`text-sm font-medium ${estado.textColor}`}>
                  {documento.estado === 'vencido'
                    ? `Venció el ${documento.fechaVencimiento.toLocaleDateString()}`
                    : `Vence el ${documento.fechaVencimiento.toLocaleDateString()}`
                  }
                </span>
              </div>
              {documento.estado === 'por_vencer' && onRenew && (
                <Button size="sm" variant="outline" onClick={() => onRenew(documento)}>
                  <Upload className="h-3 w-3 mr-1" />
                  Renovar
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Metadatos adicionales */}
        {documento.metadata && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              {documento.metadata.pagina && (
                <span>Páginas: {documento.metadata.pagina}</span>
              )}
              {documento.metadata.firmas && (
                <span>Firmas: {documento.metadata.firmas}</span>
              )}
              {documento.metadata.dpi && (
                <span>Calidad: {documento.metadata.dpi} DPI</span>
              )}
            </div>
            {documento.aprobado && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Aprobado</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {documento.tags && documento.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {documento.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Acciones principales */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onView(documento)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onDownload(documento)}
          >
            <Download className="h-3 w-3 mr-1" />
            Descargar
          </Button>
          {documento.estado === 'pendiente' && onEdit && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onEdit(documento)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Completar
            </Button>
          )}
        </div>

        {/* Descripción adicional */}
        {documento.descripcion && (
          <div className="text-sm text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
            {documento.descripcion}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para vista de lista (más compacta)
export function DocumentoListItem({
  documento,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  onRenew
}: Omit<DocumentoCardProps, 'compact' | 'showScoutInfo'>) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { hijos } = useFamiliaData()

  const scout = hijos?.find(h => h.id.toString() === documento.scoutId)

  // Configuración de estados (reutilizar del componente principal)
  const estadoConfig = {
    vigente: { color: 'default', icon: CheckCircle, label: 'Vigente' },
    por_vencer: { color: 'secondary', icon: Clock, label: 'Vence Pronto' },
    vencido: { color: 'destructive', icon: AlertTriangle, label: 'Vencido' },
    pendiente: { color: 'outline', icon: Upload, label: 'Pendiente' },
    en_revision: { color: 'secondary', icon: Archive, label: 'En Revisión' }
  }

  const estado = estadoConfig[documento.estado] || estadoConfig.pendiente
  const EstadoIcon = estado.icon

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(documento)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <FileText className="h-5 w-5 text-gray-500" />
        <div className="flex-1">
          <p className="font-medium">{documento.titulo}</p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {scout && <span>{scout.nombre} {scout.apellidos}</span>}
            <span>{formatFileSize(documento.tamañoArchivo)}</span>
            <span>{documento.fechaSubida.toLocaleDateString()}</span>
            {documento.fechaVencimiento && (
              <span>Vence: {documento.fechaVencimiento.toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Badge variant={estado.color as any} className="flex items-center gap-1">
          <EstadoIcon className="h-3 w-3" />
          {estado.label}
        </Badge>

        <div className="flex space-x-1">
          <Button size="sm" variant="ghost" onClick={() => onView(documento)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDownload(documento)}>
            <Download className="h-4 w-4" />
          </Button>
          {(documento.estado === 'vencido' || documento.estado === 'por_vencer') && onRenew && (
            <Button size="sm" variant="ghost" onClick={() => onRenew(documento)}>
              <Upload className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onEdit(documento)}>
            <Edit className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el documento "{documento.titulo}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}