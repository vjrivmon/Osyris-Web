"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import { getAuthToken, makeAuthenticatedRequest, getApiUrl } from "@/lib/auth-utils"
import {
  FileText,
  Save,
  Eye,
  Globe,
  Clock,
  User,
  Loader2,
  AlertCircle,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  Quote,
  Code,
  Heading1,
  Heading2,
  Hash,
  X,
  Check,
  Edit3,
  Trash2,
  Copy,
  Download,
  Search,
  FolderOpen,
  FileImage,
  Settings,
  ChevronRight,
  ChevronDown,
  Palette,
  Type,
  AlignLeft,
  Undo,
  Redo,
  ListOrdered,
  ImagePlus,
  EyeOff
} from "lucide-react"

interface Page {
  id?: number
  titulo: string
  slug: string
  contenido: string
  resumen?: string
  meta_descripcion?: string
  imagen_destacada?: string | null
  estado: 'borrador' | 'publicada' | 'archivada'
  tipo: string
  orden_menu?: number
  mostrar_en_menu?: boolean
  permite_comentarios?: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
  fecha_publicacion?: string | null
  creado_por?: number
}

interface UploadedFile {
  id: number
  titulo: string
  archivo_nombre: string
  archivo_ruta: string
  url: string
  tipo_archivo: string
  tamaño_archivo: number
  fecha_subida: string
}

export default function PagesAdminPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [currentTab, setCurrentTab] = useState('editor')
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadPages()
    loadUploadedFiles()
  }, [])

  const loadPages = async () => {
    setIsLoading(true)
    try {
      const token = getAuthToken()
      if (!token) {
        toast({
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente",
          variant: "destructive",
        })
        window.location.href = '/login'
        return
      }

      const data = await makeAuthenticatedRequest('/api/paginas', {
        method: 'GET'
      })

      console.log('Pages loaded:', data)
      if (data.success && data.data) {
        setPages(data.data)
      } else if (Array.isArray(data)) {
        setPages(data)
      } else {
        console.error('Failed to load pages: Invalid response format')
        throw new Error('Failed to load pages: Invalid response format')
      }
    } catch (error) {
      console.error('Error loading pages:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las páginas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUploadedFiles = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/uploads', {
        method: 'GET'
      })

      if (data.success && data.data) {
        setUploadedFiles(data.data)
      } else if (Array.isArray(data)) {
        setUploadedFiles(data)
      } else {
        setUploadedFiles([])
      }
    } catch (error) {
      console.error('Error loading files:', error)
      setUploadedFiles([])
    }
  }

  const handleSavePage = async () => {
    if (!selectedPage) return

    setIsSaving(true)
    try {
      const method = selectedPage.id ? 'PUT' : 'POST'
      const url = selectedPage.id
        ? `/api/paginas/${selectedPage.id}`
        : '/api/paginas'

      const response = await makeAuthenticatedRequest(url, {
        method,
        body: JSON.stringify(selectedPage)
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Éxito",
          description: selectedPage.id ? "Página actualizada correctamente" : "Página creada correctamente",
        })
        loadPages()
        if (!selectedPage.id && data.data) {
          setSelectedPage(data.data)
        }
      } else {
        throw new Error('Failed to save page')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la página",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('titulo', file.name)
      formData.append('descripcion', `Archivo subido el ${new Date().toLocaleDateString()}`)

      const token = getAuthToken()
      const response = await fetch(`${getApiUrl()}/api/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Archivo subido",
          description: "El archivo se ha subido correctamente",
        })
        loadUploadedFiles()
        return data.data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      })
    } finally {
      setIsUploadingFile(false)
    }
  }

  const insertTextAtCursor = (text: string) => {
    if (!editorRef.current || !selectedPage) return

    const textarea = editorRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentContent = selectedPage.contenido || ''

    const newContent =
      currentContent.substring(0, start) +
      text +
      currentContent.substring(end)

    setSelectedPage({ ...selectedPage, contenido: newContent })

    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + text.length
      textarea.selectionEnd = start + text.length
    }, 0)
  }

  const wrapSelection = (before: string, after: string = before) => {
    if (!editorRef.current || !selectedPage) return

    const textarea = editorRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentContent = selectedPage.contenido || ''
    const selectedText = currentContent.substring(start, end)

    const newContent =
      currentContent.substring(0, start) +
      before + selectedText + after +
      currentContent.substring(end)

    setSelectedPage({ ...selectedPage, contenido: newContent })

    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.selectionStart = start
        textarea.selectionEnd = end + before.length + after.length
      } else {
        textarea.selectionStart = start + before.length
        textarea.selectionEnd = start + before.length
      }
    }, 0)
  }

  const insertImage = (file: UploadedFile) => {
    const imageMarkdown = `![${file.titulo || 'Imagen'}](${file.url})\n\n`
    insertTextAtCursor(imageMarkdown)
    setShowImageGallery(false)
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    for (const file of imageFiles) {
      const uploadedFile = await handleFileUpload(file)
      if (uploadedFile) {
        insertImage(uploadedFile)
      }
    }
  }, [selectedPage])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const filteredPages = pages.filter(page =>
    page.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'publicada': return 'success'
      case 'borrador': return 'warning'
      case 'archivada': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'publicada': return <Globe className="h-3 w-3" />
      case 'borrador': return <Edit3 className="h-3 w-3" />
      case 'archivada': return <FolderOpen className="h-3 w-3" />
      default: return null
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Edit3 className="h-6 w-6 text-primary" />
              Editor de Páginas
            </h1>
            {selectedPage && (
              <Badge className={`bg-${getStatusColor(selectedPage.estado)}-100 text-${getStatusColor(selectedPage.estado)}-800`}>
                {getStatusIcon(selectedPage.estado)}
                <span className="ml-1">{selectedPage.estado}</span>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedPage && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showPreview ? 'Ocultar Vista Previa' : 'Mostrar Vista Previa'}
                </Button>
                <Button
                  onClick={handleSavePage}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={loadPages}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Lista de Páginas */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar páginas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : filteredPages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No se encontraron páginas</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPage(page)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedPage?.id === page.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{page.titulo}</div>
                          <div className={`text-xs mt-1 ${
                            selectedPage?.id === page.id ? 'text-primary-foreground/70' : 'text-gray-500'
                          }`}>
                            /{page.slug}
                          </div>
                        </div>
                        <Badge
                          variant={selectedPage?.id === page.id ? "secondary" : "outline"}
                          className="ml-2 shrink-0"
                        >
                          {page.tipo}
                        </Badge>
                      </div>
                      {page.fecha_actualizacion && (
                        <div className={`flex items-center gap-1 mt-2 text-xs ${
                          selectedPage?.id === page.id ? 'text-primary-foreground/70' : 'text-gray-400'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {new Date(page.fecha_actualizacion).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        {selectedPage ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Panel */}
            <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col bg-white`}>
              <div className="border-b px-6 py-3">
                <div className="flex gap-6">
                  <button
                    onClick={() => setCurrentTab('editor')}
                    className={`pb-2 px-1 border-b-2 transition-colors ${
                      currentTab === 'editor'
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Contenido
                  </button>
                  <button
                    onClick={() => setCurrentTab('metadata')}
                    className={`pb-2 px-1 border-b-2 transition-colors ${
                      currentTab === 'metadata'
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Metadatos
                  </button>
                  <button
                    onClick={() => setCurrentTab('images')}
                    className={`pb-2 px-1 border-b-2 transition-colors ${
                      currentTab === 'images'
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Imágenes
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {currentTab === 'editor' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        id="titulo"
                        value={selectedPage.titulo}
                        onChange={(e) => setSelectedPage({...selectedPage, titulo: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">URL (slug)</Label>
                      <Input
                        id="slug"
                        value={selectedPage.slug}
                        onChange={(e) => setSelectedPage({...selectedPage, slug: e.target.value})}
                        className="mt-1"
                        placeholder="ej: sobre-nosotros"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Contenido (Markdown)</Label>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => wrapSelection('**')}
                            title="Negrita"
                          >
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => wrapSelection('*')}
                            title="Cursiva"
                          >
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => insertTextAtCursor('# ')}
                            title="Título 1"
                          >
                            <Heading1 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => insertTextAtCursor('## ')}
                            title="Título 2"
                          >
                            <Heading2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => insertTextAtCursor('- ')}
                            title="Lista"
                          >
                            <List className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => insertTextAtCursor('1. ')}
                            title="Lista numerada"
                          >
                            <ListOrdered className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => wrapSelection('[', '](url)')}
                            title="Enlace"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowImageGallery(true)}
                            title="Insertar imagen"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => wrapSelection('`')}
                            title="Código"
                          >
                            <Code className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => insertTextAtCursor('> ')}
                            title="Cita"
                          >
                            <Quote className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div
                        className={`relative border rounded-lg transition-colors ${
                          dragOver ? 'border-primary bg-primary/5' : ''
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <Textarea
                          ref={editorRef}
                          value={selectedPage.contenido || ''}
                          onChange={(e) => setSelectedPage({...selectedPage, contenido: e.target.value})}
                          className="min-h-[400px] font-mono text-sm border-0 resize-none"
                          placeholder="Escribe el contenido en Markdown..."
                        />
                        {dragOver && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                              <Upload className="h-5 w-5" />
                              <span>Suelta las imágenes aquí</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === 'metadata' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resumen">Resumen</Label>
                      <Textarea
                        id="resumen"
                        value={selectedPage.resumen || ''}
                        onChange={(e) => setSelectedPage({...selectedPage, resumen: e.target.value})}
                        className="mt-1"
                        rows={3}
                        placeholder="Breve descripción de la página..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="meta_descripcion">Meta Descripción (SEO)</Label>
                      <Textarea
                        id="meta_descripcion"
                        value={selectedPage.meta_descripcion || ''}
                        onChange={(e) => setSelectedPage({...selectedPage, meta_descripcion: e.target.value})}
                        className="mt-1"
                        rows={2}
                        placeholder="Descripción para motores de búsqueda..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="estado">Estado</Label>
                        <Select
                          value={selectedPage.estado}
                          onValueChange={(value: 'borrador' | 'publicada' | 'archivada') =>
                            setSelectedPage({...selectedPage, estado: value})
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="borrador">
                              <span className="flex items-center gap-2">
                                <Edit3 className="h-4 w-4" />
                                Borrador
                              </span>
                            </SelectItem>
                            <SelectItem value="publicada">
                              <span className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Publicada
                              </span>
                            </SelectItem>
                            <SelectItem value="archivada">
                              <span className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                Archivada
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="tipo">Tipo</Label>
                        <Select
                          value={selectedPage.tipo}
                          onValueChange={(value) => setSelectedPage({...selectedPage, tipo: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pagina">Página</SelectItem>
                            <SelectItem value="articulo">Artículo</SelectItem>
                            <SelectItem value="noticia">Noticia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="orden_menu">Orden en Menú</Label>
                        <Input
                          id="orden_menu"
                          type="number"
                          value={selectedPage.orden_menu || 0}
                          onChange={(e) => setSelectedPage({...selectedPage, orden_menu: parseInt(e.target.value)})}
                          className="mt-1"
                          min="0"
                        />
                      </div>

                      <div className="space-y-3 pt-6">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="mostrar_en_menu"
                            checked={selectedPage.mostrar_en_menu || false}
                            onCheckedChange={(checked) => setSelectedPage({...selectedPage, mostrar_en_menu: checked})}
                          />
                          <Label htmlFor="mostrar_en_menu">Mostrar en menú</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="permite_comentarios"
                            checked={selectedPage.permite_comentarios || false}
                            onCheckedChange={(checked) => setSelectedPage({...selectedPage, permite_comentarios: checked})}
                          />
                          <Label htmlFor="permite_comentarios">Permitir comentarios</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === 'images' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label>Galería de Imágenes</Label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Subir Imagen
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || [])
                              for (const file of files) {
                                await handleFileUpload(file)
                              }
                            }}
                          />
                        </div>
                      </div>

                      {isUploadingFile && (
                        <div className="flex items-center justify-center py-8 text-gray-500">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Subiendo archivo...</span>
                        </div>
                      )}

                      {uploadedFiles.length === 0 ? (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500 mb-2">No hay imágenes subidas</p>
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Subir Primera Imagen
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {uploadedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="border rounded-lg p-3 hover:shadow-lg transition-shadow cursor-pointer group"
                              onClick={() => insertImage(file)}
                            >
                              <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                                {file.tipo_archivo?.startsWith('image/') ? (
                                  <img
                                    src={file.url}
                                    alt={file.titulo}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FileImage className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium truncate">{file.titulo}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    {new Date(file.fecha_subida).toLocaleDateString()}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      insertImage(file)
                                    }}
                                  >
                                    <ImagePlus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Panel */}
            {showPreview && (
              <div className="w-1/2 bg-gray-50 border-l flex flex-col">
                <div className="border-b bg-white px-6 py-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vista Previa
                  </h3>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6">
                    <article className="prose prose-lg max-w-none">
                      <h1>{selectedPage.titulo}</h1>
                      {selectedPage.resumen && (
                        <p className="lead text-gray-600">{selectedPage.resumen}</p>
                      )}
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedPage.contenido || ''}
                      </ReactMarkdown>
                    </article>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-medium text-gray-600 mb-2">
                Selecciona una página para editar
              </h2>
              <p className="text-gray-500">
                Elige una página de la lista o crea una nueva
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[800px] max-h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Seleccionar Imagen</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageGallery(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-4">No hay imágenes disponibles</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowImageGallery(false)
                      fileInputRef.current?.click()
                    }}
                  >
                    Subir Primera Imagen
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="border rounded-lg p-3 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => insertImage(file)}
                    >
                      <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                        {file.tipo_archivo?.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileImage className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm truncate">{file.titulo}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}