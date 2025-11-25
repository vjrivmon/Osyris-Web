'use client'

import { useState, useRef } from 'react'
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
  Clock
} from 'lucide-react'
import { TipoDocumento, DOCUMENTO_TIPO_CONFIG } from '@/types/familia'
import { useGoogleDrive } from '@/hooks/useGoogleDrive'

interface DocumentoUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  educandoId: number
  educandoNombre: string
  tipoDocumento: TipoDocumento
  onSuccess?: () => void
}

export function DocumentoUploadModal({
  open,
  onOpenChange,
  educandoId,
  educandoNombre,
  tipoDocumento,
  onSuccess
}: DocumentoUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    uploadDocumento,
    downloadPlantilla,
    getPlantillaParaTipo,
    loading: driveLoading
  } = useGoogleDrive()

  const tipoConfig = DOCUMENTO_TIPO_CONFIG[tipoDocumento]
  const plantilla = getPlantillaParaTipo(tipoDocumento)

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
    setUploadProgress(0)
    setUploadResult(null)
    onOpenChange(false)
  }

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
      <DialogContent className="sm:max-w-md">
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
          {/* Descargar plantilla si existe */}
          {tipoConfig?.tienePlantilla && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">Plantilla disponible</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadPlantilla}
                disabled={driveLoading || !plantilla}
                className="border-blue-300 text-blue-600 hover:bg-blue-100"
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

          {/* Zona de drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
                <p className="font-medium text-green-700">{file.name}</p>
                <p className="text-sm text-green-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Quitar
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-gray-600">
                  Arrastra y suelta el archivo aquí
                </p>
                <p className="text-sm text-gray-500">o</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Seleccionar archivo
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, JPG, JPEG o PNG (máx. 10MB)
                </p>
              </div>
            )}
          </div>

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
                <Alert className="border-amber-200 bg-amber-50">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
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
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
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
