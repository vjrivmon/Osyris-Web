"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { makeAuthenticatedRequest, getApiUrl, getAuthToken } from "@/lib/auth-utils"
import {
  Upload,
  Loader2,
  RefreshCw,
  Search,
  FolderOpen,
  FileImage,
  Download,
  Trash2,
  Grid3X3,
  List as ListIcon,
  File,
  FileText,
  Image as ImageIcon,
  X,
  HardDrive,
  Files,
  Filter,
  BarChart3,
  Eye
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UploadedFile {
  id: number
  titulo: string
  descripcion?: string
  archivo_nombre: string
  archivo_ruta: string
  url: string
  tipo_archivo: string
  tamaño_archivo: number
  fecha_subida: string
  subido_por?: number
}

interface FileStats {
  total: number
  totalSize: number
  byType: {
    images?: number
    documents?: number
    others?: number
  }
}

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'image' | 'application' | 'document'

export default function FilesAdminPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [folders, setFolders] = useState<string[]>([])
  const [fileStats, setFileStats] = useState<FileStats | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadFiles()
    loadFolders()
    loadStats()
  }, [])

  useEffect(() => {
    filterFiles()
  }, [files, searchTerm, filterType, selectedFolder])

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      const data = await makeAuthenticatedRequest('/api/uploads', {
        method: 'GET'
      })

      if (data.success && data.data) {
        setFiles(data.data)
      } else if (Array.isArray(data)) {
        setFiles(data)
      } else {
        setFiles([])
      }
    } catch (error) {
      console.error('Error loading files:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los archivos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadFolders = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/uploads/folders', {
        method: 'GET'
      })

      if (data.success && data.data) {
        setFolders(data.data)
      }
    } catch (error) {
      console.error('Error loading folders:', error)
    }
  }

  const loadStats = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/uploads/stats', {
        method: 'GET'
      })

      if (data.success && data.data) {
        setFileStats(data.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const filterFiles = () => {
    let filtered = [...files]

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.archivo_nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      if (filterType === 'document') {
        filtered = filtered.filter(file =>
          file.tipo_archivo.includes('pdf') ||
          file.tipo_archivo.includes('document') ||
          file.tipo_archivo.includes('msword')
        )
      } else {
        filtered = filtered.filter(file => file.tipo_archivo.startsWith(filterType))
      }
    }

    // Filtrar por carpeta
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(file =>
        file.archivo_ruta.includes(`/${selectedFolder}/`)
      )
    }

    setFilteredFiles(filtered)
  }

  const handleFileUpload = async (filesList: FileList | File[]) => {
    setIsUploading(true)
    try {
      const filesArray = Array.from(filesList)

      for (const file of filesArray) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('titulo', file.name)
        formData.append('folder', selectedFolder === 'all' ? 'general' : selectedFolder)

        const token = getAuthToken()
        const response = await fetch(`${getApiUrl()}/api/uploads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || 'Error al subir archivo')
        }
      }

      toast({
        title: "Archivos subidos",
        description: `${filesArray.length} archivo(s) subido(s) correctamente`,
      })

      loadFiles()
      loadStats()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el archivo",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteFile = async (file: UploadedFile) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/uploads/${file.id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        toast({
          title: "Archivo eliminado",
          description: "El archivo se ha eliminado correctamente",
        })
        loadFiles()
        loadStats()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setFileToDelete(null)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileUpload(files)
    }
  }, [selectedFolder])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="h-6 w-6" />
    if (mimeType.includes('pdf')) return <FileText className="h-6 w-6" />
    if (mimeType.includes('document') || mimeType.includes('msword')) return <FileText className="h-6 w-6" />
    return <File className="h-6 w-6" />
  }

  const downloadFile = (file: UploadedFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.titulo
    link.click()
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b bg-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Files className="h-6 w-6 text-red-600" />
              Gestión de Archivos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Administra todos los archivos del sistema
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <ListIcon className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadFiles}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Subir Archivos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files)
                }
              }}
            />
          </div>
        </div>

        {/* Estadísticas */}
        {fileStats && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Archivos</p>
                    <p className="text-2xl font-bold">{fileStats.total}</p>
                  </div>
                  <Files className="h-8 w-8 text-red-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Almacenamiento</p>
                    <p className="text-2xl font-bold">{formatFileSize(fileStats.totalSize)}</p>
                  </div>
                  <HardDrive className="h-8 w-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Imágenes</p>
                    <p className="text-2xl font-bold">{fileStats.byType.images || 0}</p>
                  </div>
                  <ImageIcon className="h-8 w-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Documentos</p>
                    <p className="text-2xl font-bold">{fileStats.byType.documents || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Filtros */}
        <div className="w-64 border-r bg-card p-4 overflow-auto">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Search className="h-3 w-3" />
                BUSCAR
              </Label>
              <Input
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>

            <Separator />

            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Filter className="h-3 w-3" />
                TIPO DE ARCHIVO
              </Label>
              <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="image">Imágenes</SelectItem>
                  <SelectItem value="document">Documentos</SelectItem>
                  <SelectItem value="application">Aplicaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <FolderOpen className="h-3 w-3" />
                CARPETAS
              </Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las carpetas</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder} value={folder}>
                      {folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(searchTerm || filterType !== 'all' || selectedFolder !== 'all') && (
              <>
                <Separator />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterType('all')
                    setSelectedFolder('all')
                  }}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar Filtros
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div
            className={`p-6 min-h-full transition-colors ${
              dragOver ? 'bg-red-50 dark:bg-red-950/20' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {dragOver && (
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-red-600 text-white px-8 py-4 rounded-lg shadow-2xl flex items-center gap-3">
                  <Upload className="h-6 w-6" />
                  <span className="text-lg font-medium">Suelta los archivos aquí</span>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Files className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {searchTerm || filterType !== 'all' || selectedFolder !== 'all'
                    ? 'No se encontraron archivos'
                    : 'No hay archivos subidos'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm || filterType !== 'all' || selectedFolder !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Arrastra archivos aquí o haz clic en "Subir Archivos"'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {file.tipo_archivo.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            {getFileIcon(file.tipo_archivo)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium text-sm truncate" title={file.titulo}>
                          {file.titulo}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(file.tamaño_archivo)}</span>
                          <Badge variant="outline" className="text-xs">
                            {file.tipo_archivo.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.fecha_subida).toLocaleDateString()}
                        </p>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedFile(file)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadFile(file)}
                            className="flex-1"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setFileToDelete(file)
                              setShowDeleteDialog(true)
                            }}
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                          {file.tipo_archivo.startsWith('image/') ? (
                            <img
                              src={file.url}
                              alt={file.titulo}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="text-gray-400">
                              {getFileIcon(file.tipo_archivo)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.titulo}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.tamaño_archivo)}</span>
                            <span>•</span>
                            <span>{new Date(file.fecha_subida).toLocaleDateString()}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {file.tipo_archivo.split('/')[1]?.toUpperCase() || 'FILE'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setFileToDelete(file)
                              setShowDeleteDialog(true)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El archivo "{fileToDelete?.titulo}" se eliminará permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFileToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && handleDeleteFile(fileToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* File Preview Dialog */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900">
              <div>
                <h3 className="font-semibold">{selectedFile.titulo}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.tamaño_archivo)} • {selectedFile.tipo_archivo}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              {selectedFile.tipo_archivo.startsWith('image/') ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.titulo}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  {getFileIcon(selectedFile.tipo_archivo)}
                  <p className="mt-4 text-muted-foreground">
                    Vista previa no disponible para este tipo de archivo
                  </p>
                  <Button
                    onClick={() => downloadFile(selectedFile)}
                    className="mt-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Archivo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
