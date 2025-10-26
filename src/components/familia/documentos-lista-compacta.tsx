'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Heart,
  Shield,
  Syringe,
  CreditCard,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react"
import { ScoutHijo, Documento, TipoDocumento, DOCUMENTO_TIPO_CONFIG, DocumentoUtils } from "@/types/familia"
import { DocumentoItemSimple, DocumentoItemPlaceholder } from "./documento-item-simple"

interface DocumentosListaCompactaProps {
  hijo?: ScoutHijo
  onUploadDocumento?: (tipo: TipoDocumento) => void
  onViewDocumento?: (documento: Documento) => void
  onDownloadDocumento?: (documento: Documento) => void
  compact?: boolean
  className?: string
}

export function DocumentosListaCompacta({
  hijo,
  onUploadDocumento,
  onViewDocumento,
  onDownloadDocumento,
  compact = false,
  className
}: DocumentosListaCompactaProps) {
  const [verDetalles, setVerDetalles] = useState(!compact)

  // Tipos de documentos estándar
  const tiposDocumentosEstandar: TipoDocumento[] = [
    'ficha_inscripcion',
    'ficha_sanitaria',
    'sip',
    'vacunas',
    'dni_padre_madre'
  ]

  // Crear mapa de documentos del hijo
  const documentosMap = new Map<TipoDocumento, Documento>()
  hijo?.documentos?.forEach(doc => {
    documentosMap.set(doc.tipo, doc)
  })

  // Crear lista completa de documentos (existentes + placeholders)
  const listaDocumentos: (Documento | { tipo: TipoDocumento; placeholder: true })[] =
    tiposDocumentosEstandar.map(tipo => {
      const documento = documentosMap.get(tipo)
      if (documento) {
        return documento
      }
      return { tipo, placeholder: true }
    })

  // Calcular estadísticas
  const totalDocumentos = tiposDocumentosEstandar.length
  const documentosSubidos = hijo?.documentos?.length || 0
  const documentosCompletos = hijo?.documentos?.filter(d =>
    d.estado === 'actualizado' || d.estado === 'correcto'
  ).length || 0
  const documentosCriticos = hijo?.documentos?.filter(d =>
    DocumentoUtils.esCritico(d.estado)
  ).length || 0
  const documentosFaltantes = totalDocumentos - documentosSubidos
  const progreso = DocumentoUtils.calcularProgreso(hijo?.documentos || [])

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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Documentos de {hijo.nombre}</span>
            </CardTitle>
            <CardDescription className="mt-1">
              {documentosCompletos}/{totalDocumentos} documentos completos
            </CardDescription>
          </div>

          {!compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVerDetalles(!verDetalles)}
            >
              {verDetalles ? 'Ocultar detalles' : 'Ver detalles'}
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

        {/* Estadísticas minimalistas */}
        <div className="flex items-center gap-6 mt-5 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{documentosCompletos} completos</span>
          </div>
          {documentosCriticos > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-600 font-medium">{documentosCriticos} pendientes</span>
            </div>
          )}
          {documentosFaltantes > 0 && (
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{documentosFaltantes} faltan</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Alerta minimalista si hay documentos críticos */}
        {documentosCriticos > 0 && (
          <Alert variant="default" className="mb-6 border-red-200 bg-red-50/50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-700">
              {documentosCriticos} documento{documentosCriticos > 1 ? 's' : ''} pendiente{documentosCriticos > 1 ? 's' : ''} de subir
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de documentos */}
        <div className="space-y-3">
          {listaDocumentos.map((item, index) => {
            if ('placeholder' in item) {
              // Es un placeholder (documento faltante) - estilo minimalista
              return (
                <div
                  key={item.tipo}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-50">
                      {item.tipo === 'ficha_inscripcion' && <FileText className="h-4 w-4 text-gray-400" />}
                      {item.tipo === 'ficha_sanitaria' && <Heart className="h-4 w-4 text-gray-400" />}
                      {item.tipo === 'sip' && <Shield className="h-4 w-4 text-gray-400" />}
                      {item.tipo === 'vacunas' && <Syringe className="h-4 w-4 text-gray-400" />}
                      {item.tipo === 'dni_padre_madre' && <CreditCard className="h-4 w-4 text-gray-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-700">{DOCUMENTO_TIPO_CONFIG[item.tipo].label}</p>
                      <p className="text-xs text-red-600 font-medium">Documento faltante</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUploadDocumento?.(item.tipo)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Subir
                  </Button>
                </div>
              )
            }

            // Es un documento real
            return (
              <DocumentoItemSimple
                key={item.id || item.tipo}
                documento={item}
                compact={!verDetalles}
                onUpload={() => onUploadDocumento?.(item.tipo)}
                onView={() => onViewDocumento?.(item)}
                onDownload={() => onDownloadDocumento?.(item)}
              />
            )
          })}
        </div>

        {/* Información adicional minimalista */}
        {!compact && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600 space-y-1">
                <p>Los documentos deben estar actualizados al inicio de cada curso</p>
                <p>La ficha sanitaria es obligatoria para todas las actividades</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
