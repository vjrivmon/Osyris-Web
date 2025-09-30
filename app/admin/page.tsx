"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAuthToken, makeAuthenticatedRequest, getApiUrl } from "@/lib/auth-utils"
import {
  Upload,
  FileText,
  Users,
  Settings,
  Eye,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  UserPlus,
  Shield,
  Database,
  HardDrive,
  Server,
  AlertCircle,
  CheckCircle,
  Activity,
  Copy,
  Image,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function AdminDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Estados del sistema
  const [systemStats, setSystemStats] = useState({
    users: 0,
    files: 0,
    pages: 0,
    storage: { used: 0, total: 100 }
  })

  // Estados para uploads
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileTitle, setFileTitle] = useState('')
  const [fileDescription, setFileDescription] = useState('')

  // Estados para usuarios
  const [users, setUsers] = useState<any[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidos: '',
    rol: 'scouter'
  })

  // Estados para páginas
  const [pages, setPages] = useState<any[]>([])
  const [selectedPage, setSelectedPage] = useState<any>(null)
  const [editingPage, setEditingPage] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [pageTitle, setPageTitle] = useState('')
  const [pageContent, setPageContent] = useState('')

  useEffect(() => {
    loadSystemStats()
    loadUsers()
    loadFiles()
    loadPages()
  }, [])

  // Using centralized auth utils now - getAuthToken imported

  // Cargar estadísticas del sistema
  const loadSystemStats = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        console.error('No token found for stats')
        return
      }

      const [usersResponse, filesResponse, pagesResponse] = await Promise.all([
        makeAuthenticatedRequest('/api/usuarios'),
        makeAuthenticatedRequest('/api/uploads'),
        makeAuthenticatedRequest('/api/paginas')
      ])

      let userCount = 0
      let fileCount = 0
      let pageCount = 0
      let totalStorage = 0

      if (usersResponse.success) {
        userCount = usersResponse.data?.length || 0
      }

      if (filesResponse.success) {
        fileCount = filesResponse.data?.length || 0
        // Calcular storage real basado en archivos
        totalStorage = filesResponse.data?.reduce((total: number, file: any) =>
          total + (file.size || file.tamaño_archivo || 0), 0) || 0
      }

      if (pagesResponse.success) {
        pageCount = pagesResponse.data?.length || 0
      }

      // Calcular porcentaje de almacenamiento (asumiendo límite de 1GB)
      const storageLimit = 1024 * 1024 * 1024 // 1GB en bytes
      const usedPercentage = Math.round((totalStorage / storageLimit) * 100)

      setSystemStats({
        users: userCount,
        files: fileCount,
        pages: pageCount,
        storage: { used: usedPercentage, total: 100 }
      })
    } catch (error) {
      console.error('Error loading system stats:', error)
    }
  }

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        console.error('No token found')
        setUsers([])
        return
      }

      const response = await makeAuthenticatedRequest('/api/usuarios')

      if (response.success) {
        console.log('Users loaded:', response.data)
        setUsers(response.data || [])
      } else {
        console.error('Failed to load users:', response)
        setUsers([])
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    }
  }

  // Cargar archivos
  const loadFiles = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        setUploadedFiles([])
        return
      }

      const response = await makeAuthenticatedRequest('/api/uploads')

      if (response.success) {
        console.log('Files loaded:', response.data)
        setUploadedFiles(response.data || [])
      } else {
        console.error('Failed to load files:', response)
        setUploadedFiles([])
      }
    } catch (error) {
      console.error('Error loading files:', error)
      setUploadedFiles([])
    }
  }

  // Cargar páginas reales del CMS
  const loadPages = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        setPages([])
        return
      }

      const response = await makeAuthenticatedRequest('/api/paginas')

      if (response.success) {
        console.log('Pages loaded:', response.data)
        // Convertir formato de páginas del CMS al formato esperado por la UI
        const formattedPages = response.data?.map((page: any) => ({
          id: page.id,
          name: page.titulo,
          path: `/${page.slug}`,
          title: page.titulo,
          content: page.contenido,
          slug: page.slug,
          estado: page.estado,
          tipo: page.tipo
        })) || []
        setPages(formattedPages)
      } else {
        console.error('Failed to load pages:', response.status)
        setPages([])
      }
    } catch (error) {
      console.error('Error loading pages:', error)
      setPages([])
    }
  }

  // Funciones para archivos
  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'El archivo es demasiado grande (máximo 10MB)',
        variant: 'destructive'
      })
      return
    }

    setSelectedFile(file)
    setFileTitle(file.name.split('.')[0]) // Set default title without extension
    setFileDescription('')

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const resetFileSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setFileTitle('')
    setFileDescription('')
    setUploadProgress(0)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: '✅ Copiado',
        description: 'URL copiada al portapapeles'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar al portapapeles',
        variant: 'destructive'
      })
    }
  }

  const deleteFile = async (fileId: number) => {
    try {
      setIsLoading(true)
      const token = getAuthToken()

      const response = await makeAuthenticatedRequest(`/api/uploads/${fileId}`, {
        method: 'DELETE'
      })

      if (response.success) {
        toast({
          title: '✅ Archivo eliminado',
          description: 'El archivo se ha eliminado correctamente'
        })
        loadFiles()
        loadSystemStats()
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !fileTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, proporciona un título para el archivo',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsLoading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('folder', 'general')
      formData.append('altText', fileDescription)
      formData.append('titulo', fileTitle)

      const token = getAuthToken()
      if (!token) {
        throw new Error('No se encontró token de autenticación')
      }

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setUploadProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 201) {
          const data = JSON.parse(xhr.responseText)
          toast({
            title: '✅ Archivo subido',
            description: 'El archivo se ha subido correctamente y está disponible para usar en el editor de páginas'
          })
          resetFileSelection()
          loadFiles()
          loadSystemStats()
        } else {
          throw new Error('Error al subir archivo')
        }
        setIsLoading(false)
      }

      xhr.onerror = () => {
        throw new Error('Error de red al subir archivo')
        setIsLoading(false)
      }

      const apiUrl = getApiUrl()
      xhr.open('POST', `${apiUrl}/api/uploads`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(formData)

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo subir el archivo',
        variant: 'destructive'
      })
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  // Funciones para usuarios
  const addUser = async () => {
    try {
      setIsLoading(true)
      const token = getAuthToken()

      const response = await makeAuthenticatedRequest('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })

      if (response.success) {
        toast({
          title: '✅ Usuario creado',
          description: 'El usuario se ha creado correctamente'
        })
        setNewUser({ email: '', password: '', nombre: '', apellidos: '', rol: 'scouter' })
        setShowAddUser(false)
        loadUsers()
        loadSystemStats()
      } else {
        throw new Error(response.message || 'Error al crear usuario')
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear usuario',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Funciones para páginas
  const selectPage = (page: any) => {
    setSelectedPage(page)
    setPageTitle(page.title)
    setPageContent(page.content)
    setEditingPage(false)
    setShowPreview(false)
  }

  const startEditing = () => {
    setEditingPage(true)
    setShowPreview(false)
  }

  const cancelEditing = () => {
    setEditingPage(false)
    setShowPreview(false)
    if (selectedPage) {
      setPageTitle(selectedPage.title)
      setPageContent(selectedPage.content)
    }
  }

  const savePage = async () => {
    try {
      setIsLoading(true)
      const token = getAuthToken()

      if (!token || !selectedPage) {
        throw new Error('No hay autenticación o página seleccionada')
      }

      const response = await makeAuthenticatedRequest(`/api/paginas/${selectedPage.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          titulo: pageTitle,
          contenido: pageContent,
          estado: 'publicada' // Cambiar a publicada al guardar
        })
      })

      if (response.success) {
        const updatedPage = {
          ...selectedPage,
          title: pageTitle,
          content: pageContent,
          name: pageTitle
        }
        setSelectedPage(updatedPage)
        setPages(pages.map(p => p.id === selectedPage.id ? updatedPage : p))
        setEditingPage(false)
        setShowPreview(false)

        toast({
          title: '✅ Página guardada',
          description: 'Los cambios se han guardado correctamente en la base de datos'
        })
      } else {
        throw new Error('Error al guardar en el servidor')
      }
    } catch (error) {
      console.error('Error saving page:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudieron guardar los cambios',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground">$1</blockquote>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|l|b])(.+)$/gm, '<p>$1</p>')
      .replace(/<li>/g, '<ul class="list-disc list-inside space-y-1"><li>')
      .replace(/<\/li>(?=(?:(?!<li>).)*$)/g, '</li></ul>')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-red-200 dark:border-red-800 pb-4">
        <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Panel de Administración CMS
        </h1>
        <p className="text-red-600 dark:text-red-400 mt-2">
          Sistema de gestión de contenido para super administradores
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuarios</p>
                <p className="text-2xl font-bold text-red-600">{systemStats.users}</p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archivos</p>
                <p className="text-2xl font-bold text-red-600">{systemStats.files}</p>
              </div>
              <Upload className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Páginas</p>
                <p className="text-2xl font-bold text-red-600">{systemStats.pages}</p>
              </div>
              <FileText className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Almacenamiento</p>
                <p className="text-2xl font-bold text-red-600">{systemStats.storage.used}%</p>
              </div>
              <HardDrive className="h-8 w-8 text-red-500" />
            </div>
            <Progress value={systemStats.storage.used} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-red-50 dark:bg-red-950">
          <TabsTrigger value="files" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Upload className="mr-2 h-4 w-4" />
            Archivos
          </TabsTrigger>
          <TabsTrigger value="pages" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <FileText className="mr-2 h-4 w-4" />
            Páginas
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Users className="mr-2 h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Settings className="mr-2 h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100">📤 Subir Archivo</CardTitle>
                <CardDescription>Sube imágenes y documentos al sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                      <div className="flex items-center justify-between">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetFileSelection}
                          className="text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {previewUrl && (
                        <div className="max-w-32 max-h-32 mx-auto border rounded overflow-hidden">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-red-400 mx-auto" />
                      <p className="text-red-600 dark:text-red-400">Arrastra un archivo aquí o haz clic para seleccionar</p>
                      <p className="text-sm text-muted-foreground">
                        Imágenes, PDFs y documentos Word hasta 10MB
                      </p>
                    </div>
                  )}
                </div>

                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                  accept="image/*,.pdf,.doc,.docx"
                  className="border-red-200 dark:border-red-800"
                />

                {selectedFile && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="file-title">Título del archivo *</Label>
                      <Input
                        id="file-title"
                        value={fileTitle}
                        onChange={(e) => setFileTitle(e.target.value)}
                        placeholder="Título descriptivo del archivo"
                        className="border-red-200 dark:border-red-800"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file-description">Descripción (opcional)</Label>
                      <Textarea
                        id="file-description"
                        value={fileDescription}
                        onChange={(e) => setFileDescription(e.target.value)}
                        placeholder="Descripción o texto alternativo para el archivo"
                        rows={3}
                        className="border-red-200 dark:border-red-800"
                      />
                    </div>
                  </>
                )}

                {isLoading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso de subida</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !fileTitle.trim() || isLoading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? `Subiendo... ${Math.round(uploadProgress)}%` : 'Subir Archivo'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100">📁 Archivos Subidos</CardTitle>
                <CardDescription>Total: {uploadedFiles.length} archivos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadedFiles.length > 0 ? (
                    uploadedFiles.map((file, index) => {
                      const fileUrl = `http://localhost:5000${file.archivo_ruta || file.url || '/uploads/general/' + (file.archivo_nombre || file.filename)}`
                      const isImage = file.tipo_archivo?.startsWith('image/') || file.type?.startsWith('image/')

                      return (
                        <div key={file.id || index} className="p-3 border rounded border-red-200 dark:border-red-800 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              {isImage ? (
                                <div className="w-12 h-12 rounded border overflow-hidden flex-shrink-0">
                                  <img
                                    src={fileUrl}
                                    alt={file.titulo || file.originalName || 'Imagen'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                      const sibling = e.currentTarget.nextElementSibling as HTMLElement
                                      if (sibling) sibling.style.display = 'flex'
                                    }}
                                  />
                                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center" style={{display: 'none'}}>
                                    <Image className="h-6 w-6 text-gray-400" />
                                  </div>
                                </div>
                              ) : (
                                <FileText className="h-12 w-12 text-red-500 flex-shrink-0" />
                              )}

                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {file.titulo || file.originalName || file.archivo_nombre || `Archivo ${index + 1}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {file.tipo_archivo || file.type || 'Desconocido'} • {((file.tamaño_archivo || file.size || 0) / 1024).toFixed(1)} KB
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted px-2 py-1 rounded truncate">
                                  {fileUrl}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950"
                                onClick={() => copyToClipboard(fileUrl)}
                                title="Copiar URL para usar en editor de páginas"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                                onClick={() => deleteFile(file.id)}
                                disabled={isLoading}
                                title="Eliminar archivo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {(file.descripcion || file.altText) && (
                            <p className="text-xs text-muted-foreground italic">
                              {file.descripcion || file.altText}
                            </p>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay archivos subidos</p>
                      <p className="text-sm mt-1">Los archivos aparecerán aquí cuando los subas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100">📄 Páginas del Sitio</CardTitle>
                <CardDescription>Selecciona una página para editar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => selectPage(page)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPage?.id === page.id
                          ? 'border-red-500 bg-red-50 dark:bg-red-950'
                          : 'border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950'
                      }`}
                    >
                      <p className="font-medium text-sm">{page.name}</p>
                      <p className="text-xs text-muted-foreground">{page.path}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2">
              {selectedPage ? (
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                          <Edit3 className="h-5 w-5" />
                          {editingPage ? 'Editando' : 'Vista'}: {selectedPage.name}
                        </CardTitle>
                        <CardDescription>{selectedPage.path}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {!editingPage ? (
                          <Button onClick={startEditing} size="sm" className="bg-red-600 hover:bg-red-700">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setShowPreview(!showPreview)}
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {showPreview ? 'Editor' : 'Vista previa'}
                            </Button>
                            <Button
                              onClick={cancelEditing}
                              variant="outline"
                              size="sm"
                              disabled={isLoading}
                              className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                            <Button
                              onClick={savePage}
                              size="sm"
                              disabled={isLoading}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {isLoading ? 'Guardando...' : 'Guardar'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingPage ? (
                      showPreview ? (
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4 bg-card border-red-200 dark:border-red-800">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-red-900 dark:text-red-100">{pageTitle}</h2>
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(pageContent) }}
                            />
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <p className="text-sm text-blue-800 dark:text-blue-400">
                              👁️ <strong>Vista previa:</strong> Así se verá la página cuando se publique.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <Label htmlFor="page-title">Título de la página</Label>
                            <Input
                              id="page-title"
                              value={pageTitle}
                              onChange={(e) => setPageTitle(e.target.value)}
                              className="mt-1 border-red-200 dark:border-red-800"
                            />
                          </div>
                          <div>
                            <Label htmlFor="page-content">Contenido (Markdown)</Label>
                            <Textarea
                              id="page-content"
                              value={pageContent}
                              onChange={(e) => setPageContent(e.target.value)}
                              rows={20}
                              className="mt-1 font-mono text-sm border-red-200 dark:border-red-800"
                              placeholder="Escribe el contenido en formato Markdown..."
                            />
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4 border border-red-200 dark:border-red-800">
                            <h4 className="font-medium text-sm mb-2">💡 Ayuda de Markdown</h4>
                            <div className="text-xs space-y-1 text-muted-foreground">
                              <p><code># Título</code> - Título principal</p>
                              <p><code>## Subtítulo</code> - Subtítulo</p>
                              <p><code>**texto**</code> - Texto en negrita</p>
                              <p><code>*texto*</code> - Texto en cursiva</p>
                              <p><code>- elemento</code> - Lista con viñetas</p>
                              <div className="border-t pt-2 mt-2">
                                <p className="font-medium text-blue-800 dark:text-blue-400 mb-1">🖼️ Imágenes:</p>
                                <p><code>![texto alt](URL)</code> - Insertar imagen</p>
                                <p className="text-yellow-600 dark:text-yellow-400">ℹ️ Ve a la pestaña "Archivos" para subir imágenes y copiar su URL</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )
                    ) : (
                      <div className="border rounded-lg p-4 bg-card border-red-200 dark:border-red-800">
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(pageContent) }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Selecciona una página de la lista para comenzar a editar
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Gestión de Usuarios</h3>
            <Button
              onClick={() => setShowAddUser(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Usuario
            </Button>
          </div>

          {showAddUser && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100">Nuevo Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={newUser.nombre}
                      onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                      className="border-red-200 dark:border-red-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input
                      id="apellidos"
                      value={newUser.apellidos}
                      onChange={(e) => setNewUser({...newUser, apellidos: e.target.value})}
                      className="border-red-200 dark:border-red-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="border-red-200 dark:border-red-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="border-red-200 dark:border-red-800"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rol">Rol</Label>
                  <Select value={newUser.rol} onValueChange={(value) => setNewUser({...newUser, rol: value})}>
                    <SelectTrigger className="border-red-200 dark:border-red-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scouter">Scouter</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addUser} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                    {isLoading ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-red-700 dark:text-red-300">
                            {user.nombre?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.nombre} {user.apellidos}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.rol === 'admin' ? 'destructive' : 'secondary'}>
                          {user.rol}
                        </Badge>
                        <Badge variant={user.activo ? 'default' : 'secondary'}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay usuarios registrados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100">🔧 Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base de datos</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Conectada</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Backend</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Operativo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Almacenamiento</span>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">{systemStats.storage.used}% usado</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100">⚙️ Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950">
                  <Database className="h-4 w-4 mr-2" />
                  Crear Backup
                </Button>
                <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950">
                  <Server className="h-4 w-4 mr-2" />
                  Limpiar Caché
                </Button>
                <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración Avanzada
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}