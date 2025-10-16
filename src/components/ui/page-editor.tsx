'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Edit3,
  Save,
  X,
  Upload,
  ImageIcon,
  Eye,
  Settings,
  Type,
  FileText,
  Monitor,
  Smartphone
} from 'lucide-react'
import { useAuthStatic } from '@/hooks/useAuthStatic'
import { toast } from 'sonner'

interface EditableElement {
  id: string
  type: 'text' | 'textarea' | 'image' | 'html'
  selector: string
  content: string
  placeholder?: string
  label?: string
  maxLength?: number
}

interface PageEditorProps {
  pageName: string
  pageSlug: string
  elements: EditableElement[]
  onSave?: (data: Record<string, any>) => void
  children: React.ReactNode
}

export function PageEditor({
  pageName,
  pageSlug,
  elements,
  onSave,
  children
}: PageEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [pageData, setPageData] = useState<any>(null)
  const { user, isAuthenticated } = useAuthStatic()
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({})

  // Solo mostrar editor si el usuario es admin
  const isAdmin = isAuthenticated && user?.rol === 'admin'

  useEffect(() => {
    if (isEditing) {
      loadPageData()
      initializeEditData()
    }
  }, [isEditing])

  const loadPageData = async () => {
    try {
      const response = await fetch(`/api/paginas/slug/${pageSlug}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setPageData(result.data)
      }
    } catch (error) {
      console.error('Error loading page data:', error)
    }
  }

  const initializeEditData = () => {
    const initialData: Record<string, any> = {}

    elements.forEach(element => {
      const domElement = document.querySelector(element.selector)
      if (domElement) {
        if (element.type === 'image') {
          initialData[element.id] = domElement.getAttribute('src') || ''
        } else {
          initialData[element.id] = domElement.textContent || domElement.innerHTML || ''
        }
      }
    })

    setEditData(initialData)
  }

  const handleInputChange = (elementId: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [elementId]: value
    }))
  }

  const handleImageUpload = async (elementId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'page-images')
    formData.append('pageSlug', pageSlug)

    try {
      setUploadProgress(prev => ({ ...prev, [elementId]: 0 }))

      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        const imageUrl = result.data.url

        handleInputChange(elementId, imageUrl)
        setUploadProgress(prev => ({ ...prev, [elementId]: 100 }))

        toast.success('Imagen subida correctamente')
      } else {
        throw new Error('Error al subir imagen')
      }
    } catch (error) {
      toast.error('Error al subir la imagen')
      console.error('Upload error:', error)
    } finally {
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[elementId]
          return newProgress
        })
      }, 1000)
    }
  }

  const applyPreview = () => {
    elements.forEach(element => {
      const domElement = document.querySelector(element.selector)
      if (domElement && editData[element.id] !== undefined) {
        if (element.type === 'image') {
          domElement.setAttribute('src', editData[element.id])
        } else if (element.type === 'html') {
          domElement.innerHTML = editData[element.id]
        } else {
          domElement.textContent = editData[element.id]
        }
      }
    })
  }

  const revertPreview = () => {
    // Recargar la página para volver al estado original
    window.location.reload()
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Preparar contenido para guardar
      const pageContent = JSON.stringify(editData)

      const saveData = {
        titulo: editData.title || pageName,
        slug: pageSlug,
        contenido: pageContent,
        estado: 'publicada',
        tipo: 'pagina'
      }

      let response
      if (pageData?.id) {
        // Actualizar página existente
        response = await fetch(`/api/paginas/${pageData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(saveData)
        })
      } else {
        // Crear nueva página
        response = await fetch('/api/paginas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(saveData)
        })
      }

      if (response.ok) {
        // Aplicar cambios al DOM
        applyPreview()

        toast.success('Página guardada correctamente')
        setIsEditing(false)
        setIsPreview(false)

        // Callback personalizado
        if (onSave) {
          onSave(editData)
        }
      } else {
        throw new Error('Error al guardar')
      }
    } catch (error) {
      toast.error('Error al guardar la página')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (isPreview) {
      revertPreview()
    }
    setIsEditing(false)
    setIsPreview(false)
    setEditData({})
  }

  const togglePreview = () => {
    if (!isPreview) {
      applyPreview()
    } else {
      revertPreview()
    }
    setIsPreview(!isPreview)
  }

  const renderEditField = (element: EditableElement) => {
    const value = editData[element.id] || ''

    switch (element.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={element.id}>{element.label || element.id}</Label>
            <Input
              id={element.id}
              value={value}
              onChange={(e) => handleInputChange(element.id, e.target.value)}
              placeholder={element.placeholder}
              maxLength={element.maxLength}
            />
            {element.maxLength && (
              <div className="text-xs text-muted-foreground text-right">
                {value.length}/{element.maxLength}
              </div>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={element.id}>{element.label || element.id}</Label>
            <Textarea
              id={element.id}
              value={value}
              onChange={(e) => handleInputChange(element.id, e.target.value)}
              placeholder={element.placeholder}
              rows={4}
              maxLength={element.maxLength}
            />
            {element.maxLength && (
              <div className="text-xs text-muted-foreground text-right">
                {value.length}/{element.maxLength}
              </div>
            )}
          </div>
        )

      case 'html':
        return (
          <div className="space-y-2">
            <Label htmlFor={element.id}>{element.label || element.id}</Label>
            <Textarea
              id={element.id}
              value={value}
              onChange={(e) => handleInputChange(element.id, e.target.value)}
              placeholder={element.placeholder}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        )

      case 'image':
        return (
          <div className="space-y-2">
            <Label htmlFor={element.id}>{element.label || element.id}</Label>
            <div className="space-y-2">
              <Input
                id={element.id}
                value={value}
                onChange={(e) => handleInputChange(element.id, e.target.value)}
                placeholder="URL de la imagen"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRefs.current[element.id]?.click()}
                  disabled={uploadProgress[element.id] !== undefined}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadProgress[element.id] !== undefined
                    ? `Subiendo... ${uploadProgress[element.id]}%`
                    : 'Subir imagen'
                  }
                </Button>
                <input
                  ref={(ref) => {
                    if (ref) fileInputRefs.current[element.id] = ref
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(element.id, file)
                  }}
                />
              </div>
              {value && (
                <div className="mt-2">
                  <img
                    src={value}
                    alt="Preview"
                    className="max-w-xs max-h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isAdmin) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {children}

      {/* Editor Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <Edit3 className="w-5 h-5 mr-2" />
              Editar página
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Editando: {pageName}
                {isPreview && (
                  <Badge variant="secondary" className="ml-2">
                    Vista previa activa
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Contenido
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Imágenes
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configuración
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="content" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-1">
                      {elements
                        .filter(el => el.type === 'text' || el.type === 'textarea' || el.type === 'html')
                        .map(element => (
                          <Card key={element.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{element.label || element.id}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {renderEditField(element)}
                            </CardContent>
                          </Card>
                        ))
                      }
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="images" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-1">
                      {elements
                        .filter(el => el.type === 'image')
                        .map(element => (
                          <Card key={element.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{element.label || element.id}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {renderEditField(element)}
                            </CardContent>
                          </Card>
                        ))
                      }
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="settings" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-1">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Información de la página</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div><strong>Nombre:</strong> {pageName}</div>
                          <div><strong>Slug:</strong> {pageSlug}</div>
                          <div><strong>Elementos editables:</strong> {elements.length}</div>
                          <div><strong>Estado:</strong> {pageData?.estado || 'Nueva'}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={togglePreview}
                  disabled={isSaving}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isPreview ? 'Salir de vista previa' : 'Vista previa'}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default PageEditor