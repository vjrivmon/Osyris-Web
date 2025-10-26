'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Heart,
  Shield,
  Syringe,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  Eye,
  Download
} from "lucide-react"
import { Documento, EstadoDocumento, TipoDocumento, DOCUMENTO_ESTADO_CONFIG, DOCUMENTO_TIPO_CONFIG } from "@/types/familia"
import { cn } from "@/lib/utils"

interface DocumentoItemSimpleProps {
  documento: Documento
  onUpload?: () => void
  onView?: () => void
  onDownload?: () => void
  compact?: boolean
}

export function DocumentoItemSimple({
  documento,
  onUpload,
  onView,
  onDownload,
  compact = false
}: DocumentoItemSimpleProps) {
  // Obtener configuración del tipo de documento
  const tipoConfig = DOCUMENTO_TIPO_CONFIG[documento.tipo]

  // Obtener configuración del estado
  const estadoConfig = DOCUMENTO_ESTADO_CONFIG[documento.estado]

  // Determinar el icono según el tipo
  const getIconComponent = () => {
    switch (documento.tipo) {
      case 'ficha_inscripcion':
        return FileText
      case 'ficha_sanitaria':
        return Heart
      case 'sip':
        return Shield
      case 'vacunas':
        return Syringe
      case 'dni_padre_madre':
        return CreditCard
      default:
        return FileText
    }
  }

  // Determinar el icono de estado
  const getEstadoIcon = () => {
    switch (documento.estado) {
      case 'actualizado':
      case 'correcto':
        return CheckCircle
      case 'pendiente':
        return Clock
      case 'falta':
        return AlertTriangle
      default:
        return AlertTriangle
    }
  }

  const IconComponent = getIconComponent()
  const EstadoIcon = getEstadoIcon()

  // Determinar si mostrar botones de acción
  const mostrarUpload = documento.estado === 'falta' || documento.estado === 'pendiente'
  const mostrarView = documento.url_archivo && (documento.estado === 'actualizado' || documento.estado === 'correcto')
  const mostrarDownload = documento.url_archivo

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "p-2 rounded-full",
            documento.estado === 'actualizado' ? "bg-green-100" :
            documento.estado === 'correcto' ? "bg-blue-100" :
            documento.estado === 'pendiente' ? "bg-yellow-100" :
            "bg-red-100"
          )}>
            <IconComponent className={cn(
              "h-4 w-4",
              documento.estado === 'actualizado' ? "text-green-600" :
              documento.estado === 'correcto' ? "text-blue-600" :
              documento.estado === 'pendiente' ? "text-yellow-600" :
              "text-red-600"
            )} />
          </div>
          <div>
            <p className="font-medium text-sm">{tipoConfig.label}</p>
            {documento.fecha_ultima_actualizacion && (
              <p className="text-xs text-muted-foreground">
                Actualizado: {new Date(documento.fecha_ultima_actualizacion).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={estadoConfig.color}>
            <EstadoIcon className="h-3 w-3 mr-1" />
            {estadoConfig.label}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border hover:shadow-md transition-shadow bg-card">
      {/* Información del documento */}
      <div className="flex items-start space-x-3 flex-1">
        <div className={cn(
          "p-3 rounded-lg",
          documento.estado === 'actualizado' ? "bg-green-100" :
          documento.estado === 'correcto' ? "bg-blue-100" :
          documento.estado === 'pendiente' ? "bg-yellow-100" :
          "bg-red-100"
        )}>
          <IconComponent className={cn(
            "h-5 w-5",
            documento.estado === 'actualizado' ? "text-green-600" :
            documento.estado === 'correcto' ? "text-blue-600" :
            documento.estado === 'pendiente' ? "text-yellow-600" :
            "text-red-600"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-base">{tipoConfig.label}</h4>
            {tipoConfig.requerido && (
              <Badge variant="secondary" className="text-xs">Requerido</Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {tipoConfig.descripcion}
          </p>

          {/* Fechas */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {documento.fecha_subida && (
              <span>
                Subido: {new Date(documento.fecha_subida).toLocaleDateString('es-ES')}
              </span>
            )}
            {documento.fecha_ultima_actualizacion && (
              <span>
                Actualizado: {new Date(documento.fecha_ultima_actualizacion).toLocaleDateString('es-ES')}
              </span>
            )}
            {documento.fecha_vencimiento && (
              <span className={cn(
                documento.estado === 'actualizado' || documento.estado === 'correcto'
                  ? "text-muted-foreground"
                  : "text-red-600 font-medium"
              )}>
                Vence: {new Date(documento.fecha_vencimiento).toLocaleDateString('es-ES')}
              </span>
            )}
          </div>

          {/* Notas */}
          {documento.notas && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              {documento.notas}
            </p>
          )}
        </div>
      </div>

      {/* Estado y acciones */}
      <div className="flex flex-col items-end space-y-2 ml-4">
        <Badge
          variant="outline"
          className={cn("text-sm", estadoConfig.color)}
        >
          <EstadoIcon className="h-3 w-3 mr-1" />
          {estadoConfig.emoji} {estadoConfig.label}
        </Badge>

        {/* Botones de acción */}
        <div className="flex space-x-1">
          {mostrarUpload && onUpload && (
            <Button
              size="sm"
              variant={documento.estado === 'falta' ? 'default' : 'outline'}
              onClick={onUpload}
              className="text-xs"
            >
              <Upload className="h-3 w-3 mr-1" />
              {documento.estado === 'falta' ? 'Subir' : 'Actualizar'}
            </Button>
          )}

          {mostrarView && onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={onView}
            >
              <Eye className="h-3 w-3" />
              <span className="sr-only">Ver documento</span>
            </Button>
          )}

          {mostrarDownload && onDownload && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDownload}
            >
              <Download className="h-3 w-3" />
              <span className="sr-only">Descargar documento</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Componente para mostrar un placeholder cuando no hay documento
 */
export function DocumentoItemPlaceholder({ tipo }: { tipo: TipoDocumento }) {
  const tipoConfig = DOCUMENTO_TIPO_CONFIG[tipo]

  const getIconComponent = () => {
    switch (tipo) {
      case 'ficha_inscripcion':
        return FileText
      case 'ficha_sanitaria':
        return Heart
      case 'sip':
        return Shield
      case 'vacunas':
        return Syringe
      case 'dni_padre_madre':
        return CreditCard
      default:
        return FileText
    }
  }

  const IconComponent = getIconComponent()

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-dashed bg-muted/50">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-lg bg-gray-100">
          <IconComponent className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <p className="font-medium text-sm">{tipoConfig.label}</p>
          <p className="text-xs text-muted-foreground">{tipoConfig.descripcion}</p>
        </div>
      </div>

      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Falta
      </Badge>
    </div>
  )
}
