'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  Eye,
  ExternalLink,
  FileSignature,
  FileCheck,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentoCampamento {
  id: string
  nombre: string
  tipo: 'circular' | 'autorizacion' | 'otro'
  url?: string
  driveFileId?: string
  tamanio?: string
  fechaSubida?: Date
  requiereFirma?: boolean
  firmado?: boolean
}

interface DocumentoCampamentoCardProps {
  documento: DocumentoCampamento
  onDescargar?: (documento: DocumentoCampamento) => Promise<void>
  onVer?: (documento: DocumentoCampamento) => void
  className?: string
}

export function DocumentoCampamentoCard({
  documento,
  onDescargar,
  onVer,
  className
}: DocumentoCampamentoCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const getIcon = () => {
    switch (documento.tipo) {
      case 'circular':
        return FileText
      case 'autorizacion':
        return documento.firmado ? FileCheck : FileSignature
      default:
        return FileText
    }
  }

  const getTipoLabel = () => {
    switch (documento.tipo) {
      case 'circular':
        return 'Circular informativa'
      case 'autorizacion':
        return 'Autorizacion'
      default:
        return 'Documento'
    }
  }

  const getBadgeVariant = () => {
    if (documento.tipo === 'autorizacion') {
      return documento.firmado ? 'default' : 'secondary'
    }
    return 'outline'
  }

  const getBadgeText = () => {
    if (documento.tipo === 'autorizacion') {
      return documento.firmado ? 'Firmado' : 'Pendiente firma'
    }
    return documento.tipo === 'circular' ? 'PDF' : 'Documento'
  }

  const Icon = getIcon()

  const handleDescargar = async () => {
    if (!onDescargar) return

    setIsDownloading(true)
    try {
      await onDescargar(documento)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            documento.tipo === 'circular' ? 'bg-blue-100' : 'bg-amber-100'
          )}>
            <Icon className={cn(
              'h-5 w-5',
              documento.tipo === 'circular' ? 'text-blue-600' : 'text-amber-600'
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{documento.nombre}</h4>
              <Badge variant={getBadgeVariant()} className="text-xs shrink-0">
                {getBadgeText()}
              </Badge>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              {getTipoLabel()}
              {documento.tamanio && <span className="mx-1">|</span>}
              {documento.tamanio && <span>{documento.tamanio}</span>}
              {documento.fechaSubida && (
                <>
                  <span className="mx-1">|</span>
                  <span>Subido el {documento.fechaSubida.toLocaleDateString('es-ES')}</span>
                </>
              )}
            </p>

            <div className="flex gap-2">
              {onVer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVer(documento)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              )}

              {onDescargar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDescargar}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-1" />
                  )}
                  Descargar
                </Button>
              )}

              {documento.url && !onDescargar && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={documento.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Abrir
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DocumentosCampamentoListProps {
  documentos: DocumentoCampamento[]
  onDescargar?: (documento: DocumentoCampamento) => Promise<void>
  onVer?: (documento: DocumentoCampamento) => void
  className?: string
}

export function DocumentosCampamentoList({
  documentos,
  onDescargar,
  onVer,
  className
}: DocumentosCampamentoListProps) {
  if (documentos.length === 0) {
    return (
      <div className={cn('text-center py-8 bg-gray-50 rounded-lg', className)}>
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No hay documentos disponibles</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {documentos.map(documento => (
        <DocumentoCampamentoCard
          key={documento.id}
          documento={documento}
          onDescargar={onDescargar}
          onVer={onVer}
        />
      ))}
    </div>
  )
}

interface DocumentacionRequeridaProps {
  items: Array<{
    nombre: string
    estado: 'completado' | 'pendiente' | 'expirado'
    detalle?: string
  }>
  className?: string
}

export function DocumentacionRequerida({
  items,
  className
}: DocumentacionRequeridaProps) {
  const getEstadoIcon = (estado: 'completado' | 'pendiente' | 'expirado') => {
    switch (estado) {
      case 'completado':
        return <FileCheck className="h-4 w-4 text-green-600" />
      case 'pendiente':
        return <FileSignature className="h-4 w-4 text-yellow-600" />
      case 'expirado':
        return <FileText className="h-4 w-4 text-red-600" />
    }
  }

  const getEstadoText = (estado: 'completado' | 'pendiente' | 'expirado') => {
    switch (estado) {
      case 'completado':
        return 'text-green-700'
      case 'pendiente':
        return 'text-yellow-700'
      case 'expirado':
        return 'text-red-700'
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-2 p-2 rounded-lg',
            item.estado === 'completado' && 'bg-green-50',
            item.estado === 'pendiente' && 'bg-yellow-50',
            item.estado === 'expirado' && 'bg-red-50'
          )}
        >
          {getEstadoIcon(item.estado)}
          <span className={cn('text-sm font-medium', getEstadoText(item.estado))}>
            {item.nombre}
          </span>
          {item.detalle && (
            <span className="text-xs text-gray-500 ml-auto">
              {item.detalle}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
