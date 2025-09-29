"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactMarkdown from "react-markdown"
import {
  FileText,
  Edit3,
  Save,
  RotateCcw,
  Eye,
  Plus,
  Globe,
  Clock,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
  EyeOff,
  SplitSquareHorizontal,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Copy,
  GripVertical
} from "lucide-react"

interface Pagina {
  id: number
  titulo: string
  slug: string
  contenido: string
  resumen?: string
  meta_descripcion?: string
  imagen_destacada?: string
  estado: 'borrador' | 'publicada' | 'archivada'
  tipo: 'pagina' | 'articulo' | 'noticia'
  orden_menu: number
  mostrar_en_menu: boolean
  permite_comentarios: boolean
  creado_por: number
  fecha_creacion: string
  fecha_actualizacion: string
  fecha_publicacion?: string
}

export default function AdminPages() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPages, setIsLoadingPages] = useState(true)
  const [pages, setPages] = useState<Pagina[]>([])
  const [selectedPage, setSelectedPage] = useState<Pagina | null>(null)
  const [editingPage, setEditingPage] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<'split' | 'preview' | 'editor'>('split')
  const [pageTitle, setPageTitle] = useState('')
  const [pageContent, setPageContent] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [pageResumen, setPageResumen] = useState('')
  const [pageEstado, setPageEstado] = useState<'borrador' | 'publicada' | 'archivada'>('borrador')
  const [error, setError] = useState<string | null>(null)

  // Estados para archivos y drag & drop
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [draggedFile, setDraggedFile] = useState<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadPages()
    loadUploadedFiles()
  }, [])

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    const userData = localStorage.getItem('osyris_user')
    if (userData) {
      const user = JSON.parse(userData)
      return user.token
    }
    return null
  }

  const loadPages = async () => {
    try {
      setIsLoadingPages(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/paginas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setPages(data.data || [])
      } else {
        throw new Error(data.message || 'Error al cargar páginas')
      }
    } catch (error) {
      console.error('Error al cargar páginas:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      toast({
        title: '❌ Error al cargar páginas',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingPages(false)
    }
  }

  // Cargar archivos subidos para drag & drop
  const loadUploadedFiles = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        setUploadedFiles([])
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/uploads`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedFiles(data.data || [])
      } else {
        console.error('Failed to load uploaded files:', response.status)
        setUploadedFiles([])
      }
    } catch (error) {
      console.error('Error loading uploaded files:', error)
      setUploadedFiles([])
    }
  }

  const selectPage = (page: Pagina) => {
    setSelectedPage(page)
    setPageTitle(page.titulo)
    setPageContent(page.contenido)
    setPageSlug(page.slug)
    setPageResumen(page.resumen || '')
    setPageEstado(page.estado)
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
      setPageTitle(selectedPage.titulo)
      setPageContent(selectedPage.contenido)
      setPageSlug(selectedPage.slug)
      setPageResumen(selectedPage.resumen || '')
      setPageEstado(selectedPage.estado)
    }
  }

  const savePage = async () => {
    try {
      setIsLoading(true)

      if (!selectedPage) {
        throw new Error('No hay página seleccionada')
      }

      const token = getAuthToken()
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const updatedData = {
        titulo: pageTitle,
        contenido: pageContent,
        slug: pageSlug,
        resumen: pageResumen,
        estado: pageEstado
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/paginas/${selectedPage.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        const updatedPage = data.data
        setSelectedPage(updatedPage)
        setPages(pages.map(p => p.id === selectedPage.id ? updatedPage : p))

        setEditingPage(false)
        setShowPreview(false)

        toast({
          title: '✅ Página guardada',
          description: 'Los cambios se han guardado correctamente en la base de datos'
        })
      } else {
        throw new Error(data.message || 'Error al guardar la página')
      }
    } catch (error) {
      console.error('Error al guardar página:', error)
      toast({
        title: '❌ Error al guardar',
        description: error instanceof Error ? error.message : 'No se pudieron guardar los cambios',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Funciones para drag & drop de archivos
  const handleFileDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (!draggedFile) return

    // Generate markdown for the file
    let markdownInsert = ''
    const fileUrl = `http://localhost:5000${draggedFile.archivo_ruta || '/uploads/general/' + draggedFile.archivo_nombre}`

    if (draggedFile.tipo_archivo?.startsWith('image/')) {
      markdownInsert = `![${draggedFile.alt_text || draggedFile.titulo}](${fileUrl} "${draggedFile.titulo}")`
    } else {
      markdownInsert = `[${draggedFile.titulo}](${fileUrl})`
    }

    // Insert at cursor position using enhanced function
    insertAtCursor(markdownInsert)

    // Reset dragged file
    setDraggedFile(null)

    toast({
      title: '✅ Archivo insertado',
      description: `Se ha insertado ${draggedFile.titulo} en el contenido`
    })
  }

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    // Only set isDragging to false if we're actually leaving the textarea
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false)
    }
  }

  // Enhanced insert text at cursor position
  const insertAtCursor = (insertText: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      // Fallback: insert at end if no textarea reference
      setPageContent(prev => prev + '\n\n' + insertText)
      return
    }

    // Store current scroll position
    const scrollTop = textarea.scrollTop

    // Get selection/cursor position
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const textBefore = pageContent.substring(0, start)
    const textAfter = pageContent.substring(end)

    // Determine if we need line breaks
    let finalInsertText = insertText

    // Add line breaks if cursor is not at start of line and text before doesn't end with newline
    if (start > 0 && !textBefore.endsWith('\n') && !textBefore.endsWith('\n\n')) {
      finalInsertText = '\n' + insertText
    }

    // Add line break after if text after doesn't start with newline
    if (textAfter.length > 0 && !textAfter.startsWith('\n')) {
      finalInsertText += '\n'
    }

    // Insert the text
    const newContent = textBefore + finalInsertText + textAfter
    setPageContent(newContent)

    // Restore cursor position and focus
    const newCursorPos = start + finalInsertText.length
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.scrollTop = scrollTop
      }
    }, 10)
  }

  // Quick insert functions
  const insertImage = (file: any) => {
    const fileUrl = `http://localhost:5000${file.archivo_ruta || '/uploads/general/' + file.archivo_nombre}`
    const markdownImage = `![${file.alt_text || file.titulo}](${fileUrl} "${file.titulo}")`
    insertAtCursor(markdownImage)
    toast({
      title: '✅ Imagen insertada',
      description: `Se ha insertado la imagen ${file.titulo}`
    })
  }

  const insertFile = (file: any) => {
    const fileUrl = `http://localhost:5000${file.archivo_ruta || '/uploads/general/' + file.archivo_nombre}`
    const markdownLink = `[${file.titulo}](${fileUrl})`
    insertAtCursor(markdownLink)
    toast({
      title: '✅ Enlace insertado',
      description: `Se ha insertado el enlace ${file.titulo}`
    })
  }

  const copyFileUrl = async (file: any) => {
    const fileUrl = `http://localhost:5000${file.archivo_ruta || '/uploads/general/' + file.archivo_nombre}`
    try {
      await navigator.clipboard.writeText(fileUrl)
      toast({
        title: '✅ URL copiada',
        description: 'La URL del archivo se ha copiado al portapapeles'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar la URL',
        variant: 'destructive'
      })
    }
  }

  const getFileIcon = (file: any) => {
    if (file.tipo_archivo?.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    }
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const renderMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-red-900 dark:text-red-100">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-4 text-red-800 dark:text-red-200">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-3 text-red-700 dark:text-red-300">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-red-900 dark:text-red-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\s*("([^"]*)")?\)/g, '<img src="$2" alt="$1" title="$4" class="max-w-full h-auto rounded-lg shadow-md my-4" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-red-600 hover:text-red-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^- (.*$)/gm, '<li class="mb-1">$1</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-red-500 pl-4 italic text-muted-foreground bg-red-50 dark:bg-red-950 p-3 rounded-r-lg my-4">$1</blockquote>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l|b|i|a])(.+)$/gm, '<p class="mb-4">$1</p>')
      .replace(/<li>/g, '<ul class="list-disc list-inside space-y-1 mb-4 pl-4"><li>')
      .replace(/<\/li>(?=(?:(?!<li>).)*$)/g, '</li></ul>')
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Fecha no válida'
    }
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'publicada':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            Publicada
          </Badge>
        )
      case 'archivada':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
            Archivada
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
            Borrador
          </Badge>
        )
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-red-200 dark:border-red-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-red-900 dark:text-red-100">📝 Gestión de Páginas</h1>
          <p className="text-red-600 dark:text-red-400 mt-2">
            Edita el contenido de las páginas del sitio web
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadPages}
            variant="outline"
            disabled={isLoadingPages}
            className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
          >
            {isLoadingPages ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Página
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Pages List */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-100">📄 Páginas del Sitio</CardTitle>
            <CardDescription>
              Selecciona una página para editar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">Error al cargar páginas</p>
                </div>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">{error}</p>
              </div>
            )}

            {isLoadingPages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                <span className="ml-2 text-muted-foreground">Cargando páginas...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay páginas disponibles</p>
                  </div>
                ) : (
                  pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => selectPage(page)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPage?.id === page.id
                          ? 'border-red-500 bg-red-50 dark:bg-red-950'
                          : 'border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{page.titulo}</p>
                        {getStatusBadge(page.estado)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">/{page.slug}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(page.fecha_actualizacion)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          ID: {page.creado_por}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Files Sidebar */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-100">📁 Archivos</CardTitle>
            <CardDescription>
              Arrastra archivos al editor o haz clic para insertar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uploadedFiles.length > 0 ? (
                uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 border rounded-lg border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 cursor-grab transition-all duration-200 hover:shadow-md"
                    draggable
                    onDragStart={(e) => {
                      setDraggedFile(file)
                      // Add drag effect
                      e.currentTarget.style.opacity = '0.5'
                    }}
                    onDragEnd={(e) => {
                      setDraggedFile(null)
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.titulo}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.tamaño_archivo)}</p>
                        </div>
                      </div>
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>

                    {/* File preview for images */}
                    {file.tipo_archivo?.startsWith('image/') && (
                      <div className="mt-2">
                        <img
                          src={`http://localhost:5000${file.archivo_ruta || '/uploads/general/' + file.archivo_nombre}`}
                          alt={file.titulo}
                          className="w-full h-20 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Quick actions */}
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-6 px-2"
                        onClick={() => file.tipo_archivo?.startsWith('image/') ? insertImage(file) : insertFile(file)}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Insertar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-6 px-2"
                        onClick={() => copyFileUrl(file)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        URL
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay archivos disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Page Editor */}
        <div className="lg:col-span-2">
          {selectedPage ? (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                      <Edit3 className="h-5 w-5" />
                      {editingPage ? 'Editando' : 'Vista'}: {selectedPage.titulo}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Globe className="h-4 w-4" />
                      /{selectedPage.slug}
                      {getStatusBadge(selectedPage.estado)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {!editingPage ? (
                      <Button onClick={startEditing} size="sm" className="bg-red-600 hover:bg-red-700">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as any)} className="w-auto">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="editor" className="text-xs">
                              <Edit3 className="h-3 w-3 mr-1" />
                              Editor
                            </TabsTrigger>
                            <TabsTrigger value="split" className="text-xs">
                              <SplitSquareHorizontal className="h-3 w-3 mr-1" />
                              Dividido
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Vista previa
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
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
                          disabled={isLoading || !pageTitle.trim() || !pageContent.trim() || !pageSlug.trim()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
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
                    /* Vista previa durante la edición */
                    <div className="space-y-4">
                      <div className="border rounded-lg p-6 bg-card border-red-200 dark:border-red-800">
                        <h1 className="text-2xl font-bold mb-4 border-b pb-2 text-red-900 dark:text-red-100">
                          {pageTitle}
                        </h1>
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(pageContent) }}
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                          👁️ <strong>Vista previa:</strong> Así se verá la página cuando se publique. Haz clic en "Editor" para volver a editar.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Editor de contenido */
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="page-title">Título de la página</Label>
                          <Input
                            id="page-title"
                            value={pageTitle}
                            onChange={(e) => setPageTitle(e.target.value)}
                            className="mt-1 border-red-200 dark:border-red-800"
                            placeholder="Título que aparecerá en la página"
                          />
                        </div>
                        <div>
                          <Label htmlFor="page-slug">URL (slug)</Label>
                          <Input
                            id="page-slug"
                            value={pageSlug}
                            onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                            className="mt-1 border-red-200 dark:border-red-800"
                            placeholder="url-de-la-pagina"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="page-resumen">Resumen</Label>
                          <Textarea
                            id="page-resumen"
                            value={pageResumen}
                            onChange={(e) => setPageResumen(e.target.value)}
                            rows={3}
                            className="mt-1 border-red-200 dark:border-red-800"
                            placeholder="Breve descripción de la página..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="page-estado">Estado de publicación</Label>
                          <select
                            id="page-estado"
                            value={pageEstado}
                            onChange={(e) => setPageEstado(e.target.value as 'borrador' | 'publicada' | 'archivada')}
                            className="mt-1 w-full rounded-md border border-red-200 dark:border-red-800 bg-background px-3 py-2 text-sm"
                          >
                            <option value="borrador">Borrador</option>
                            <option value="publicada">Publicada</option>
                            <option value="archivada">Archivada</option>
                          </select>
                        </div>
                      </div>

                      {/* Split View Editor */}
                      <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as any)} className="w-full">
                        <div className="flex items-center justify-between mb-4">
                          <TabsList className="grid w-80 grid-cols-3">
                            <TabsTrigger value="editor" className="text-xs">
                              <Edit3 className="h-3 w-3 mr-1" />
                              Editor
                            </TabsTrigger>
                            <TabsTrigger value="split" className="text-xs">
                              <SplitSquareHorizontal className="h-3 w-3 mr-1" />
                              Dividido
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Vista previa
                            </TabsTrigger>
                          </TabsList>
                          {isDragging && (
                            <Badge variant="outline" className="text-blue-600 animate-pulse">
                              <Upload className="h-3 w-3 mr-1" />
                              Suelta en el editor para insertar
                            </Badge>
                          )}
                        </div>

                        <TabsContent value="editor" className="mt-0">
                          <div>
                            <Label htmlFor="page-content">Contenido (Markdown)</Label>
                            <Textarea
                              ref={textareaRef}
                              id="page-content"
                              value={pageContent}
                              onChange={(e) => setPageContent(e.target.value)}
                              rows={25}
                              className={`mt-1 font-mono text-sm border-red-200 dark:border-red-800 transition-all duration-200 ${
                                isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 border-2' : ''
                              }`}
                              placeholder="Escribe el contenido en formato Markdown... Puedes arrastrar archivos desde la barra lateral."
                              onDrop={handleFileDrop}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="split" className="mt-0">
                          <div className="grid grid-cols-2 gap-4 h-96">
                            <div>
                              <Label htmlFor="page-content-split">Editor</Label>
                              <Textarea
                                ref={textareaRef}
                                id="page-content-split"
                                value={pageContent}
                                onChange={(e) => setPageContent(e.target.value)}
                                rows={20}
                                className={`mt-1 font-mono text-sm border-red-200 dark:border-red-800 transition-all duration-200 h-full resize-none ${
                                  isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 border-2' : ''
                                }`}
                                placeholder="Escribe el contenido en formato Markdown..."
                                onDrop={handleFileDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                              />
                            </div>
                            <div>
                              <Label>Vista Previa</Label>
                              <div className="mt-1 border border-red-200 dark:border-red-800 rounded-md p-4 bg-background h-full overflow-y-auto">
                                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-red-900 dark:prose-headings:text-red-100 prose-a:text-red-600 dark:prose-a:text-red-400">
                                  <ReactMarkdown
                                    components={{
                                      img: ({ node, ...props }) => (
                                        <img
                                          {...props}
                                          className="max-w-full h-auto rounded-lg shadow-md my-4"
                                          style={{ maxHeight: '300px', objectFit: 'contain' }}
                                        />
                                      ),
                                      a: ({ node, ...props }) => (
                                        <a {...props} className="text-red-600 hover:text-red-800 underline" target="_blank" rel="noopener noreferrer" />
                                      )
                                    }}
                                  >
                                    {pageContent || '*Escribe contenido en el editor para ver la vista previa...*'}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="preview" className="mt-0">
                          <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-background">
                            <h1 className="text-2xl font-bold mb-4 border-b border-red-200 dark:border-red-800 pb-2 text-red-900 dark:text-red-100">
                              {pageTitle || 'Título de la página'}
                            </h1>
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-red-900 dark:prose-headings:text-red-100 prose-a:text-red-600 dark:prose-a:text-red-400">
                              <ReactMarkdown
                                components={{
                                  img: ({ node, ...props }) => (
                                    <img
                                      {...props}
                                      className="max-w-full h-auto rounded-lg shadow-md my-4"
                                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                                    />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a {...props} className="text-red-600 hover:text-red-800 underline" target="_blank" rel="noopener noreferrer" />
                                  )
                                }}
                              >
                                {pageContent || '*No hay contenido para mostrar. Ve al editor para agregar contenido.*'}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Ayuda de Markdown */}
                      <Card className="bg-muted/50 border-red-200 dark:border-red-800">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-sm mb-3 text-red-900 dark:text-red-100">💡 Guía Rápida de Markdown</h4>
                          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                            <div className="space-y-1">
                              <p><code className="bg-red-100 dark:bg-red-900 px-1 rounded"># Título</code> - Título principal</p>
                              <p><code className="bg-red-100 dark:bg-red-900 px-1 rounded">## Subtítulo</code> - Subtítulo</p>
                              <p><code className="bg-red-100 dark:bg-red-900 px-1 rounded">### Título menor</code> - Título de tercer nivel</p>
                              <p><code className="bg-red-100 dark:bg-red-900 px-1 rounded">**texto**</code> - Texto en negrita</p>
                            </div>
                            <div className="space-y-1">
                              <p><code className="bg-red-100 dark:bg-red-900 px-1 rounded">*texto*</code> - Texto en cursiva</p>
                              <p><code className="bg-red-100 dark:bg-red-900 px-1 rounded">- elemento</code> - Lista con viñetas</p>
                              <p><code className="bg-red-100 dark:bg-red-900 px-1 rounded">&gt; cita</code> - Cita destacada</p>
                              <p><code className="bg-red-100 dark:bg-red-900 px-1 rounded">[link](url)</code> - Enlace</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )
                ) : (
                  /* Vista de solo lectura */
                  <div className="border rounded-lg p-6 bg-card border-red-200 dark:border-red-800">
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
              <CardContent className="py-20 text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecciona una página</h3>
                <p className="text-muted-foreground">
                  Elige una página de la lista de la izquierda para comenzar a editar su contenido
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}