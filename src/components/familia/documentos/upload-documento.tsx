'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Upload,
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  Download,
  Image as ImageIcon,
  File,
  Trash2,
  RefreshCw,
  Smartphone,
  Monitor,
  Paperclip
} from "lucide-react"
import { DocumentoFamilia, PlantillaDocumento, UploadProgress } from '@/hooks/useDocumentosFamilia'
import { useFamiliaData } from '@/hooks/useFamiliaData'
import { useToast } from '@/hooks/use-toast'

interface UploadDocumentoProps {
  onUpload: (file: File, data: Partial<DocumentoFamilia>) => Promise<boolean>
  onDownloadPlantilla?: (plantillaId: string) => Promise<void>
  plantillas?: PlantillaDocumento[] | null
  uploadProgress?: UploadProgress | null
  isOpen?: boolean
  onClose?: () => void
  scoutId?: string
}

export function UploadDocumento({
  onUpload,
  onDownloadPlantilla,
  plantillas,
  uploadProgress,
  isOpen = false,
  onClose,
  scoutId
}: UploadDocumentoProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(isOpen)
  const [activeTab, setActiveTab] = useState('upload')
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipoDocumento: '',
    fechaVencimiento: undefined as Date | undefined,
    tags: [] as string[],
    scoutId: scoutId || ''
  })

  const [newTag, setNewTag] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { hijos } = useFamiliaData()
  const { toast } = useToast()

  // Tipos de documento configurados
  const tiposDocumento = [
    { value: 'autorizacion_medica', label: 'Autorización Médica', requiereVencimiento: true },
    { value: 'seguro_accidentes', label: 'Seguro de Accidentes', requiereVencimiento: true },
    { value: 'autorizacion_imagen', label: 'Autorización de Imagen', requiereVencimiento: false },
    { value: 'autorizacion_transporte', label: 'Autorización de Transporte', requiereVencimiento: false },
    { value: 'ficha_alergias', label: 'Ficha de Alergias', requiereVencimiento: false },
    { value: 'informe_medico', label: 'Informe Médico', requiereVencimiento: false },
    { value: 'inscripcion', label: 'Ficha de Inscripción', requiereVencimiento: false },
    { value: 'dni', label: 'Copia DNI', requiereVencimiento: false },
    { value: 'foto_carnet', label: 'Foto Carnet', requiereVencimiento: false },
    { value: 'otro', label: 'Otro Documento', requiereVencimiento: false }
  ]

  // Validar archivo
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no permitido. Se permite PDF, JPG, PNG, DOC, DOCX'
      }
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Máximo 10MB'
      }
    }

    return { valid: true }
  }

  // Manejar selección de archivo
  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      setUploadError(validation.error || 'Archivo no válido')
      return
    }

    setSelectedFile(file)
    setUploadError(null)

    // Generar preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }

    // Auto-completar título si no está definido
    if (!formData.titulo) {
      const tipoConfig = tiposDocumento.find(t => t.value === formData.tipoDocumento)
      if (tipoConfig) {
        setFormData(prev => ({
          ...prev,
          titulo: tipoConfig.label
        }))
      }
    }
  }, [formData.titulo, formData.tipoDocumento])

  // Manejar drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [handleFileSelect])

  // Manejar input de archivo
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // Manejar input de cámara
  const handleCameraInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // Limpiar archivo seleccionado
  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Agregar tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // Eliminar tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setUploadError('Por favor selecciona un archivo')
      return
    }

    if (!formData.titulo.trim()) {
      setUploadError('Por favor ingresa un título')
      return
    }

    if (!formData.tipoDocumento) {
      setUploadError('Por favor selecciona un tipo de documento')
      return
    }

    if (!formData.scoutId && hijos && hijos.length > 0) {
      setUploadError('Por favor selecciona un scout')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const tipoConfig = tiposDocumento.find(t => t.value === formData.tipoDocumento)

      const documentoData: Partial<DocumentoFamilia> = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        tipoDocumento: formData.tipoDocumento as DocumentoFamilia['tipoDocumento'],
        fechaVencimiento: tipoConfig?.requiereVencimiento ? formData.fechaVencimiento : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        scoutId: formData.scoutId
      }

      const success = await onUpload(selectedFile, documentoData)

      if (success) {
        toast({
          title: "Documento subido",
          description: "El documento se ha subido correctamente",
        })

        // Reset form
        setFormData({
          titulo: '',
          descripcion: '',
          tipoDocumento: '',
          fechaVencimiento: undefined,
          tags: [],
          scoutId: scoutId || ''
        })
        clearFile()
        setIsDialogOpen(false)
        onClose?.()
      } else {
        setUploadError('Error al subir el documento. Inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error uploading documento:', error)
      setUploadError('Error al subir el documento. Inténtalo de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Subir Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Nuevo Documento</DialogTitle>
          <DialogDescription>
            Sube documentos importantes para tus hijos. Puedes usar archivos existentes, tomar una foto o descargar plantillas.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Subir Archivo
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Tomar Foto
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Plantillas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Drag & Drop */}
            <Card>
              <CardContent className="p-6">
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">
                        Arrastra y suelta tu archivo aquí
                      </p>
                      <p className="text-sm text-muted-foreground">
                        o haz clic para seleccionarlo
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Formatos aceptados: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview del archivo seleccionado */}
            {selectedFile && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Archivo Seleccionado</CardTitle>
                    <Button size="sm" variant="ghost" onClick={clearFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {selectedFile.type.startsWith('image/') && previewUrl ? (
                      <div className="relative w-16 h-16 border rounded">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  {previewUrl && (
                    <div className="border rounded p-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full h-auto max-h-48 mx-auto"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="camera" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium">Tomar Fotografía</p>
                    <p className="text-sm text-muted-foreground">
                      Usa la cámara de tu dispositivo para capturar el documento
                    </p>
                  </div>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraInput}
                    className="hidden"
                  />
                  <Button onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="h-4 w-4 mr-2" />
                    Abrir Cámara
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Asegúrate de tener buena iluminación y que el texto sea legible
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips para tomar fotos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Consejos para una buena foto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Usa buena iluminación natural si es posible</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Mantién el documento plano y sin sombras</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Asegúrate que todo el texto sea visible y legible</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Evita mover la cámara al tomar la foto</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plantillas Disponibles</CardTitle>
                <CardDescription>
                  Descarga plantillas predefinidas para facilitar la documentación
                </CardDescription>
              </CardHeader>
              <CardContent>
                {plantillas && plantillas.length > 0 ? (
                  <div className="space-y-3">
                    {plantillas.map((plantilla) => (
                      <div key={plantilla.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{plantilla.titulo}</p>
                            <p className="text-sm text-muted-foreground">
                              {plantilla.descripcion}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDownloadPlantilla?.(plantilla.id)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Descargar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay plantillas disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información sobre plantillas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  ¿Cómo usar las plantillas?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">1. Descarga la plantilla</p>
                    <p className="text-muted-foreground">
                      Selecciona la plantilla que necesitas y descárgala en tu dispositivo
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">2. Completa la información</p>
                    <p className="text-muted-foreground">
                      Rellena los campos requeridos con la información de tu hijo/a
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">3. Firma y guarda</p>
                    <p className="text-muted-foreground">
                      Firma el documento donde corresponda y guárdalo en formato PDF
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">4. Súbelo aquí</p>
                    <p className="text-muted-foreground">
                      Vuelve a la pestaña "Subir Archivo" y adjunta el documento completado
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Formulario de datos del documento */}
        {selectedFile && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <div>
                <Label htmlFor="titulo">Título del documento *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Autorización Médica Carlos García"
                  required
                />
              </div>

              {/* Tipo de documento */}
              <div>
                <Label htmlFor="tipo">Tipo de documento *</Label>
                <Select
                  value={formData.tipoDocumento}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipoDocumento: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDocumento.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Añade notas o detalles adicionales sobre este documento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scout */}
              <div>
                <Label htmlFor="scout">Scout *</Label>
                <Select
                  value={formData.scoutId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, scoutId: value }))}
                  disabled={!!scoutId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un scout" />
                  </SelectTrigger>
                  <SelectContent>
                    {hijos?.map((hijo) => (
                      <SelectItem key={hijo.id} value={hijo.id.toString()}>
                        {hijo.nombre} {hijo.apellidos} - {hijo.seccion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha de vencimiento */}
              <div>
                <Label htmlFor="vencimiento">Fecha de vencimiento</Label>
                <DatePicker
                  value={formData.fechaVencimiento}
                  onChange={(date) => setFormData(prev => ({ ...prev, fechaVencimiento: date }))}
                  placeholder="Selecciona fecha"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags (opcional)</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Añadir tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Añadir
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Error y progreso */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {uploadProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subiendo documento...</span>
                  <span>{uploadProgress.percentage}%</span>
                </div>
                <Progress value={uploadProgress.percentage} />
                {uploadProgress.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{uploadProgress.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Documento
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Componente simplificado para subida rápida (sin modal)
export function QuickUpload({
  onUpload,
  scoutId,
  className
}: {
  onUpload: (file: File, data: Partial<DocumentoFamilia>) => Promise<boolean>
  scoutId?: string
  className?: string
}) {
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0])
    }
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)

    try {
      // Validaciones básicas
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Tipo de archivo no permitido",
          variant: "destructive"
        })
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo es demasiado grande (máx. 10MB)",
          variant: "destructive"
        })
        return
      }

      // Datos básicos para subida rápida
      const documentoData: Partial<DocumentoFamilia> = {
        titulo: file.name.replace(/\.[^/.]+$/, ""), // Quitar extensión
        tipoDocumento: 'otro',
        scoutId: scoutId || ''
      }

      const success = await onUpload(file, documentoData)

      if (success) {
        toast({
          title: "Documento subido",
          description: "El documento se ha subido correctamente",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo subir el documento",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error uploading documento:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al subir el documento",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
        dragActive
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${isUploading ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />

      <div className="space-y-2">
        {isUploading ? (
          <>
            <RefreshCw className="mx-auto h-6 w-6 text-blue-600 animate-spin" />
            <p className="text-sm font-medium">Subiendo documento...</p>
          </>
        ) : (
          <>
            <Upload className="mx-auto h-6 w-6 text-gray-400" />
            <p className="text-sm font-medium">
              Arrastra un archivo aquí para subirlo rápidamente
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  )
}