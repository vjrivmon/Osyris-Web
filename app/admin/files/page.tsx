"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken, makeAuthenticatedRequest, getApiUrl } from "@/lib/auth-utils"
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function AdminFiles() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [folder, setFolder] = useState("general")
  const [altText, setAltText] = useState("")

  useEffect(() => {
    loadFiles()
  }, [])

  // Using centralized auth utils now - getAuthToken imported

  const loadFiles = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        setUploadedFiles([])
        return
      }

      const response = await makeAuthenticatedRequest('/api/uploads')

      if (response.ok) {
        const data = await response.json()
        setUploadedFiles(data.data || [])
      } else {
        setUploadedFiles([])
      }
    } catch (error) {
      console.error('Error loading files:', error)
      setUploadedFiles([])
    }
  }

  const handleFileSelect = (file: File) => {
    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'El archivo es demasiado grande (máximo 10MB)',
        variant: 'destructive'
      })
      return
    }

    // Check file type (match backend validation)
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: `Tipo de archivo no permitido. Formatos admitidos: imágenes (JPG, PNG, GIF, WebP) y documentos (PDF, Word)`,
        variant: 'destructive'
      })
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('folder', folder)
      formData.append('altText', altText)

      const token = getAuthToken()
      const apiUrl = getApiUrl()

      console.log('Making upload request to:', `${apiUrl}/api/uploads`)
      console.log('Token present:', !!token)

      const response = await fetch(`${apiUrl}/api/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: '✅ Archivo subido',
          description: 'El archivo se ha subido correctamente'
        })
        setSelectedFile(null)
        setAltText("")
        loadFiles()
      } else {
        const error = await response.json().catch(() => ({}))
        const errorMessage = error.message || `Error ${response.status}: ${response.statusText}`

        // Log detailed error information for debugging
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          response: response
        })

        // Show specific error message instead of generic one
        toast({
          title: 'Error al subir archivo',
          description: errorMessage,
          variant: 'destructive'
        })

        return // Don't throw error, just show toast and return
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'No se pudo subir el archivo',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteFile = async (fileId: number) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/uploads/${fileId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: '✅ Archivo eliminado',
          description: 'El archivo se ha eliminado correctamente'
        })
        loadFiles()
      } else {
        throw new Error('Error al eliminar archivo')
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el archivo',
        variant: 'destructive'
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.includes('word')) return '📝'
    return '📎'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-red-200 dark:border-red-800 pb-4">
        <h1 className="text-3xl font-bold text-red-900 dark:text-red-100">📁 Gestión de Archivos</h1>
        <p className="text-red-600 dark:text-red-400 mt-2">
          Sube y gestiona archivos del sistema
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-100">📤 Subir Nuevo Archivo</CardTitle>
            <CardDescription>
              Arrastra archivos aquí o haz clic para seleccionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-red-500 bg-red-50 dark:bg-red-950'
                  : 'border-red-300 hover:border-red-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const files = Array.from(e.dataTransfer.files)
                if (files[0]) handleFileSelect(files[0])
              }}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <div>
                    <p className="font-medium text-lg">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tipo: {selectedFile.type}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-16 w-16 text-red-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-red-600 dark:text-red-400">
                      Arrastra un archivo aquí
                    </p>
                    <p className="text-sm text-muted-foreground">
                      o haz clic en el botón de abajo para seleccionar
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Imágenes: JPG, PNG, GIF, WebP</p>
                    <p>• Documentos: PDF, Word</p>
                    <p>• Tamaño máximo: 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* File Input */}
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,.pdf,.doc,.docx"
              className="border-red-200 dark:border-red-800"
            />

            {/* Upload Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="folder">Carpeta</Label>
                <Select value={folder} onValueChange={setFolder}>
                  <SelectTrigger className="border-red-200 dark:border-red-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="documentos">Documentos</SelectItem>
                    <SelectItem value="imagenes">Imágenes</SelectItem>
                    <SelectItem value="actividades">Actividades</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="altText">Texto alternativo</Label>
                <Input
                  id="altText"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Para imágenes..."
                  className="border-red-200 dark:border-red-800"
                />
              </div>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              {isLoading ? 'Subiendo...' : 'Subir Archivo'}
            </Button>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={66} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Subiendo archivo...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Files List Section */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-100 flex items-center justify-between">
              📄 Archivos Subidos
              <span className="text-sm font-normal text-muted-foreground">
                {uploadedFiles.length} archivos
              </span>
            </CardTitle>
            <CardDescription>
              Gestiona todos los archivos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadedFiles.length > 0 ? (
                uploadedFiles.map((file, index) => (
                  <div
                    key={file.id || index}
                    className="flex items-center justify-between p-3 border rounded-lg border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg flex-shrink-0">
                        {getFileIcon(file.type || file.file_type || '')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {file.originalName || file.original_name || file.filename || `Archivo ${index + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size || file.file_size || 0)} • {file.folder || 'general'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {file.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                          className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFile(file.id)}
                        className="text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay archivos subidos</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sube tu primer archivo usando el panel de la izquierda
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {uploadedFiles.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-100">📊 Estadísticas de Archivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {uploadedFiles.length}
                </p>
                <p className="text-sm text-muted-foreground">Total archivos</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {uploadedFiles.filter(f => (f.type || f.file_type || '').startsWith('image/')).length}
                </p>
                <p className="text-sm text-muted-foreground">Imágenes</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {uploadedFiles.filter(f => (f.type || f.file_type || '').includes('pdf')).length}
                </p>
                <p className="text-sm text-muted-foreground">PDFs</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {formatFileSize(uploadedFiles.reduce((total, file) => total + (file.size || file.file_size || 0), 0))}
                </p>
                <p className="text-sm text-muted-foreground">Tamaño total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}