'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  FileText,
  Download,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Clock,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react'
import { TipoDocumento, DOCUMENTO_TIPO_CONFIG } from '@/types/familia'
import { useGoogleDrive, Plantilla } from '@/hooks/useGoogleDrive'

interface DocumentoUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  educandoId: number
  educandoNombre: string
  tipoDocumento: TipoDocumento
  onSuccess?: () => void
  plantillas?: Plantilla[]  // Plantillas cargadas desde el dashboard
}

export function DocumentoUploadModal({
  open,
  onOpenChange,
  educandoId,
  educandoNombre,
  tipoDocumento,
  onSuccess,
  plantillas = []
}: DocumentoUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewZoom, setPreviewZoom] = useState(100)
  const [previewRotation, setPreviewRotation] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Limpiar URL del preview cuando cambia el archivo
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setFilePreviewUrl(url)
      setShowPreview(true)
      setPreviewZoom(100)
      setPreviewRotation(0)
      return () => URL.revokeObjectURL(url)
    } else {
      setFilePreviewUrl(null)
      setShowPreview(false)
    }
  }, [file])

  const {
    uploadDocumento,
    downloadPlantilla,
    loading: driveLoading
  } = useGoogleDrive()

  const tipoConfig = DOCUMENTO_TIPO_CONFIG[tipoDocumento]
  // Buscar plantilla correspondiente al tipo de documento desde las props
  const plantilla = plantillas.find(p => p.tipoDocumento === tipoDocumento)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadResult({
          success: false,
          message: 'Tipo de archivo no permitido. Solo PDF, JPG, JPEG y PNG.'
        })
        return
      }

      // Validar tamaño (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadResult({
          success: false,
          message: 'El archivo es demasiado grande. Máximo 10MB.'
        })
        return
      }

      setFile(selectedFile)
      setUploadResult(null)
    }
  }

  const handleDownloadPlantilla = async () => {
    if (plantilla) {
      await downloadPlantilla(plantilla.id, plantilla.name)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    // Simular progreso
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const result = await uploadDocumento(educandoId, tipoDocumento, file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setUploadResult({
        success: result.success,
        message: result.message
      })

      if (result.success) {
        setTimeout(() => {
          onSuccess?.()
          handleClose()
        }, 1500)
      }
    } catch {
      clearInterval(progressInterval)
      setUploadResult({
        success: false,
        message: 'Error al subir el documento'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setFilePreviewUrl(null)
    setShowPreview(false)
    setPreviewZoom(100)
    setPreviewRotation(0)
    setUploadProgress(0)
    setUploadResult(null)
    onOpenChange(false)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setFilePreviewUrl(null)
    setShowPreview(false)
    setPreviewZoom(100)
    setPreviewRotation(0)
  }

  const isImageFile = file?.type.startsWith('image/')
  const isPdfFile = file?.type === 'application/pdf'

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      const fakeEvent = {
        target: { files: [droppedFile] }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(fakeEvent)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`${showPreview && file ? 'sm:max-w-3xl' : 'sm:max-w-md'} transition-all duration-300`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Subir {tipoConfig?.label}
          </DialogTitle>
          <DialogDescription>
            Sube el documento para {educandoNombre}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Descargar plantilla si existe - usa plantillas cargadas desde el dashboard */}
          {plantilla && !showPreview && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">Plantilla disponible</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadPlantilla}
                disabled={driveLoading}
                className="border-blue-300 text-blue-600 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                {driveLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-3 w-3 mr-1" />
                    Descargar
                  </>
                )}
              </Button>
            </div>
          )}

          {/* VISTA PREVIA del documento */}
          {showPreview && file && filePreviewUrl && (
            <div className="space-y-3">
              {/* Cabecera del preview */}
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Vista previa del documento</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-blue-600 dark:text-blue-400 mr-2">{file.name}</span>
                  <span className="text-xs text-blue-500 dark:text-blue-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              </div>

              {/* Controles del preview (solo para imágenes) */}
              {isImageFile && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewZoom(z => Math.max(25, z - 25))}
                    disabled={previewZoom <= 25}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground w-16 text-center">{previewZoom}%</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewZoom(z => Math.min(200, z + 25))}
                    disabled={previewZoom >= 200}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-2" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewRotation(r => (r + 90) % 360)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Área del preview */}
              <div className="border rounded-lg overflow-hidden bg-muted max-h-80 flex items-center justify-center">
                {isImageFile ? (
                  <div className="overflow-auto max-h-80 w-full flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={filePreviewUrl}
                      alt="Vista previa del documento"
                      style={{
                        transform: `scale(${previewZoom / 100}) rotate(${previewRotation}deg)`,
                        transition: 'transform 0.2s ease',
                        maxWidth: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ) : isPdfFile ? (
                  <div className="w-full h-80">
                    <iframe
                      src={filePreviewUrl}
                      className="w-full h-full"
                      title="Vista previa del PDF"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/60" />
                    <p>Vista previa no disponible</p>
                    <p className="text-sm">{file.name}</p>
                  </div>
                )}
              </div>

              {/* Mensaje de confirmación */}
              <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Revisa que el documento es correcto</strong>
                  <p className="text-sm mt-1">
                    Verifica que el archivo seleccionado corresponde al tipo de documento que vas a subir.
                    Una vez subido, el kraal de sección lo revisará y aprobará o rechazará el documento.
                  </p>
                </AlertDescription>
              </Alert>

              {/* Botón para cambiar archivo */}
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Seleccionar otro archivo
                </Button>
              </div>
            </div>
          )}

          {/* Zona de drop (solo si no hay preview) */}
          {!showPreview && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                file ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30' : 'border-border hover:border-muted-foreground/50'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground/60" />
                <p className="text-muted-foreground">
                  Arrastra y suelta el archivo aquí
                </p>
                <p className="text-sm text-muted-foreground/80">o</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Seleccionar archivo
                </Button>
                <p className="text-xs text-muted-foreground/80 mt-2">
                  PDF, JPG, JPEG o PNG (máx. 10MB)
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Progreso de subida */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Subiendo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Resultado */}
          {uploadResult && (
            uploadResult.success ? (
              <div className="space-y-3">
                <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <strong>Documento pendiente de revisión</strong>
                    <p className="mt-1 text-sm">
                      El kraal de sección ha sido notificado y está revisando que la documentación es correcta.
                      Cuando lo compruebe, el estado cambiará a aprobado.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{uploadResult.message}</AlertDescription>
              </Alert>
            )
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={showPreview ? "bg-primary hover:bg-primary/90" : ""}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : showPreview ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar y subir
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir documento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
