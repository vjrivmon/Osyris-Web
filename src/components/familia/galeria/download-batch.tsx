'use client'

import { useState, useEffect } from 'react'
import { FotoGaleria, OpcionesDescarga } from '@/hooks/useGaleriaFamilia'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Download,
  X,
  Settings,
  FileImage,
  Archive,
  HardDrive,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  Zap,
  Camera,
  Tag,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DownloadBatchProps {
  photos: FotoGaleria[]
  isOpen: boolean
  onClose: () => void
  onDownload: (opciones: OpcionesDescarga) => Promise<boolean>
  loading?: boolean
  className?: string
}

export function DownloadBatch({
  photos,
  isOpen,
  onClose,
  onDownload,
  loading = false,
  className
}: DownloadBatchProps) {
  const [opciones, setOpciones] = useState<OpcionesDescarga>({
    formato: 'original',
    calidad: 90,
    incluir_metadata: true,
    renombrar_archivos: true
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Calcular tamaño estimado de la descarga
  const estimatedSize = photos.reduce((total, foto) => total + foto.tamaño_bytes, 0)
  const estimatedSizeFormatted = formatFileSize(estimatedSize)

  // Calcular tamaño optimizado según formato y calidad
  const getOptimizedSize = () => {
    let factor = 1
    if (opciones.formato === 'comprimido') factor = 0.6
    if (opciones.formato === 'web') factor = 0.3
    if (opciones.calidad < 90) factor *= opciones.calidad / 90
    return Math.round(estimatedSize * factor)
  }

  const optimizedSize = getOptimizedSize()
  const optimizedSizeFormatted = formatFileSize(optimizedSize)

  // Reset estado cuando se cierra el diálogo
  useEffect(() => {
    if (!isOpen) {
      setIsDownloading(false)
      setProgress(0)
      setDownloadComplete(false)
      setDownloadError(null)
      setShowAdvancedOptions(false)
    }
  }, [isOpen])

  // Manejar descarga
  const handleDownload = async () => {
    setIsDownloading(true)
    setProgress(0)
    setDownloadError(null)

    try {
      // Simular progreso de descarga
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const success = await onDownload(opciones)

      clearInterval(progressInterval)

      if (success) {
        setProgress(100)
        setDownloadComplete(true)
      } else {
        throw new Error('Error en la descarga')
      }
    } catch (err) {
      console.error('Error en descarga:', err)
      setDownloadError('No se pudo completar la descarga. Inténtalo de nuevo.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Calcular tiempo estimado de descarga
  const getEstimatedTime = () => {
    const speedMbps = 10 // Asumir 10 Mbps como conexión promedio
    const sizeMb = optimizedSize / (1024 * 1024)
    const timeSeconds = (sizeMb * 8) / speedMbps
    return formatTime(timeSeconds)
  }

  // Renderizado de opciones de formato
  const renderFormatOptions = () => (
    <RadioGroup
      value={opciones.formato}
      onValueChange={(value) => setOpciones(prev => ({
        ...prev,
        formato: value as 'original' | 'comprimido' | 'web'
      }))}
      className="space-y-3"
    >
      <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
        <RadioGroupItem value="original" id="original" />
        <div className="flex-1">
          <Label htmlFor="original" className="flex items-center gap-2 font-medium">
            <FileImage className="w-4 h-4" />
            Calidad original
          </Label>
          <p className="text-sm text-gray-600">Máxima calidad, sin compresión</p>
        </div>
        <Badge variant="outline">{estimatedSizeFormatted}</Badge>
      </div>

      <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
        <RadioGroupItem value="comprimido" id="comprimido" />
        <div className="flex-1">
          <Label htmlFor="comprimido" className="flex items-center gap-2 font-medium">
            <Archive className="w-4 h-4" />
            Comprimido
          </Label>
          <p className="text-sm text-gray-600">Reducción de tamaño con buena calidad</p>
        </div>
        <Badge variant="outline">{formatFileSize(estimatedSize * 0.6)}</Badge>
      </div>

      <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
        <RadioGroupItem value="web" id="web" />
        <div className="flex-1">
          <Label htmlFor="web" className="flex items-center gap-2 font-medium">
            <Zap className="w-4 h-4" />
            Para web
          </Label>
          <p className="text-sm text-gray-600">Optimizado para compartir online</p>
        </div>
        <Badge variant="outline">{formatFileSize(estimatedSize * 0.3)}</Badge>
      </div>
    </RadioGroup>
  )

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Descargar {photos.length} foto{photos.length !== 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen de la descarga */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Resumen de la descarga</h3>
              <Badge variant="secondary">{photos.length} fotos</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Tamaño:</span>
                <span className="font-medium">{optimizedSizeFormatted}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Tiempo estimado:</span>
                <span className="font-medium">{getEstimatedTime()}</span>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Camera className="w-4 h-4" />
                  <span>Formato:</span>
                  <span className="font-medium capitalize">{opciones.formato}</span>
                  {opciones.calidad < 100 && (
                    <span className="font-medium">({opciones.calidad}% calidad)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Opciones de formato */}
          <div>
            <h3 className="font-medium mb-3">Formato de descarga</h3>
            {renderFormatOptions()}
          </div>

          {/* Opciones avanzadas */}
          <div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Opciones avanzadas
              </span>
              <span className="text-sm text-gray-500">
                {showAdvancedOptions ? 'Ocultar' : 'Mostrar'}
              </span>
            </Button>

            {showAdvancedOptions && (
              <div className="mt-4 space-y-4 p-4 border rounded-lg bg-gray-50">
                {/* Control de calidad */}
                {opciones.formato !== 'original' && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Calidad: {opciones.calidad}%
                    </Label>
                    <Slider
                      value={[opciones.calidad]}
                      onValueChange={([value]) => setOpciones(prev => ({ ...prev, calidad: value }))}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Rápido</span>
                      <span>Alta calidad</span>
                    </div>
                  </div>
                )}

                {/* Opciones adicionales */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="metadata"
                      checked={opciones.incluir_metadata}
                      onCheckedChange={(checked) => setOpciones(prev => ({
                        ...prev,
                        incluir_metadata: checked as boolean
                      }))}
                    />
                    <div className="flex-1">
                      <Label htmlFor="metadata" className="flex items-center gap-2 font-medium">
                        <Tag className="w-4 h-4" />
                        Incluir metadatos
                      </Label>
                      <p className="text-sm text-gray-600">
                        Fecha, cámara, ubicación y etiquetas de scouts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="rename"
                      checked={opciones.renombrar_archivos}
                      onCheckedChange={(checked) => setOpciones(prev => ({
                        ...prev,
                        renombrar_archivos: checked as boolean
                      }))}
                    />
                    <div className="flex-1">
                      <Label htmlFor="rename" className="flex items-center gap-2 font-medium">
                        <Calendar className="w-4 h-4" />
                        Renombrar archivos
                      </Label>
                      <p className="text-sm text-gray-600">
                        Usar nombres descriptivos con fecha y título
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vista previa de fotos (limitada) */}
          {photos.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Vista previa</h3>
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {photos.slice(0, 12).map((foto, index) => (
                  <div key={foto.id} className="relative aspect-square rounded overflow-hidden bg-gray-100">
                    <img
                      src={foto.url_thumbnail}
                      alt={foto.titulo}
                      className="w-full h-full object-cover"
                    />
                    {index === 11 && photos.length > 12 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          +{photos.length - 12}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado de la descarga */}
          {(isDownloading || downloadComplete || downloadError) && (
            <div className="border rounded-lg p-4">
              {isDownloading && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Preparando descarga...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-600">
                    {progress < 30 ? 'Comprimiendo archivos...' :
                     progress < 70 ? 'Generando ZIP...' :
                     progress < 90 ? 'Finalizando...' : 'Completado'}
                  </p>
                </div>
              )}

              {downloadComplete && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">¡Descarga completada!</p>
                    <p className="text-sm text-gray-600">
                      El archivo ZIP se ha descargado en tu dispositivo
                    </p>
                  </div>
                </div>
              )}

              {downloadError && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Error en la descarga</p>
                    <p className="text-sm text-gray-600">{downloadError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Las fotos se descargarán en un archivo ZIP comprimido</li>
                  <li>• El enlace de descarga es temporal y privado para tu familia</li>
                  <li>• Las fotos conservan las etiquetas de scouts para fácil identificación</li>
                  <li>• El tiempo de descarga depende de tu conexión a internet</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isDownloading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>

            <Button
              onClick={handleDownload}
              disabled={isDownloading || loading || photos.length === 0}
              className="flex-1"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : downloadComplete ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {downloadComplete ? 'Descargado' : isDownloading ? 'Descargando...' : 'Descargar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Funciones auxiliares
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`
  } else {
    return `${Math.round(seconds / 3600)}h`
  }
}