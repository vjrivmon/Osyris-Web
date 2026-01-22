"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getApiUrl } from '@/lib/api-utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Image as ImageIcon,
  Upload,
  Search,
  Grid,
  List,
  X,
  Eye,
  Copy,
  Check,
  Loader2,
  FileText,
  Trash2,
  ExternalLink
} from 'lucide-react'

interface ImageFile {
  id: number
  titulo: string
  archivo_nombre: string
  archivo_ruta: string
  tipo_archivo: string
  tamaño_archivo: number
  alt_text?: string
  descripcion?: string
  fecha_subida: string
}

interface ImagePickerProps {
  onImageSelect: (image: ImageFile) => void
  onUrlInsert?: (url: string, altText?: string) => void
  trigger?: React.ReactNode
  multiple?: boolean
}

export function ImagePicker({
  onImageSelect,
  onUrlInsert,
  trigger,
  multiple = false
}: ImagePickerProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([])
  const [externalUrl, setExternalUrl] = useState('')
  const [externalAlt, setExternalAlt] = useState('')
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery')

  // Load images when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadImages()
    }
  }, [isOpen])

  const getAuthToken = () => {
    const userData = localStorage.getItem('osyris_user')
    if (userData) {
      const user = JSON.parse(userData)
      return user.token
    }
    return null
  }

  const loadImages = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()

      if (!token) {
        toast({
          title: 'Error de autenticación',
          description: 'No hay token de autenticación disponible',
          variant: 'destructive'
        })
        return
      }

      const response = await fetch(
        `${getApiUrl()}/api/uploads?tipo=imagen`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        const imageFiles = data.data?.filter((file: any) =>
          file.tipo_archivo?.startsWith('image/')
        ) || []
        setImages(imageFiles)
      }
    } catch (error) {
      console.error('Error loading images:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las imágenes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (image: ImageFile) => {
    if (multiple) {
      setSelectedImages(prev => {
        const isSelected = prev.find(img => img.id === image.id)
        if (isSelected) {
          return prev.filter(img => img.id !== image.id)
        } else {
          return [...prev, image]
        }
      })
    } else {
      onImageSelect(image)
      setIsOpen(false)
    }
  }

  const handleMultipleSelect = () => {
    selectedImages.forEach(image => onImageSelect(image))
    setSelectedImages([])
    setIsOpen(false)
  }

  const handleUrlInsert = () => {
    if (externalUrl && onUrlInsert) {
      onUrlInsert(externalUrl, externalAlt || undefined)
      setExternalUrl('')
      setExternalAlt('')
      setIsOpen(false)
      toast({
        title: '✅ Imagen externa insertada',
        description: 'La URL de la imagen se ha insertado en el editor'
      })
    }
  }

  const copyImageUrl = async (image: ImageFile) => {
    const url = `${getApiUrl()}${image.archivo_ruta}`
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: '✅ URL copiada',
        description: 'La URL de la imagen se ha copiado al portapapeles'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar la URL',
        variant: 'destructive'
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const filteredImages = images.filter(image =>
    image.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.archivo_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const GridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredImages.map((image) => {
        const isSelected = selectedImages.find(img => img.id === image.id)
        const imageUrl = `${getApiUrl()}${image.archivo_ruta}`

        return (
          <Card
            key={image.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              isSelected ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => handleImageSelect(image)}
          >
            <CardContent className="p-3">
              <div className="aspect-square mb-2 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 relative">
                <Image
                  src={imageUrl}
                  alt={image.alt_text || image.titulo}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png'
                  }}
                />
              </div>
              <h4 className="font-medium text-sm truncate">{image.titulo}</h4>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(image.tamaño_archivo)}
              </p>

              <div className="flex gap-1 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyImageUrl(image)
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(imageUrl, '_blank')
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const ListView = () => (
    <div className="space-y-2">
      {filteredImages.map((image) => {
        const isSelected = selectedImages.find(img => img.id === image.id)
        const imageUrl = `${getApiUrl()}${image.archivo_ruta}`

        return (
          <Card
            key={image.id}
            className={`cursor-pointer transition-all hover:bg-muted/50 ${
              isSelected ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => handleImageSelect(image)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
                  <Image
                    src={imageUrl}
                    alt={image.alt_text || image.titulo}
                    fill
                    sizes="64px"
                    className="object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{image.titulo}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {image.archivo_nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(image.tamaño_archivo)} • {new Date(image.fecha_subida).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 px-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyImageUrl(image)
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 px-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(imageUrl, '_blank')
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Insertar Imagen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Seleccionar Imagen</DialogTitle>
          <DialogDescription>
            Elige una imagen de la galería o inserta una URL externa
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 mb-4 border-b">
          <Button
            variant={activeTab === 'gallery' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('gallery')}
            className="rounded-b-none"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Galería
          </Button>
          <Button
            variant={activeTab === 'url' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('url')}
            className="rounded-b-none"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            URL Externa
          </Button>
        </div>

        {activeTab === 'gallery' && (
          <>
            {/* Search and View Controls */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar imágenes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadImages}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Image Gallery */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Cargando imágenes...</span>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron imágenes</p>
                </div>
              ) : viewMode === 'grid' ? (
                <GridView />
              ) : (
                <ListView />
              )}
            </div>

            {/* Multiple Selection Footer */}
            {multiple && selectedImages.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {selectedImages.length} imagen{selectedImages.length !== 1 ? 'es' : ''} seleccionada{selectedImages.length !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImages([])}
                  >
                    Limpiar selección
                  </Button>
                  <Button size="sm" onClick={handleMultipleSelect}>
                    Insertar seleccionadas
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="external-url">URL de la imagen</Label>
              <Input
                id="external-url"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="external-alt">Texto alternativo (opcional)</Label>
              <Input
                id="external-alt"
                placeholder="Descripción de la imagen"
                value={externalAlt}
                onChange={(e) => setExternalAlt(e.target.value)}
              />
            </div>
            {externalUrl && (
              <div className="border rounded-lg p-3 bg-muted/50">
                <p className="text-sm font-medium mb-2">Vista previa:</p>
                <div className="relative w-full h-32">
                  <Image
                    src={externalUrl}
                    alt={externalAlt || "Vista previa"}
                    fill
                    sizes="100%"
                    className="object-contain rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                    unoptimized // Para URLs externas no configuradas
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUrlInsert}
                disabled={!externalUrl}
              >
                Insertar URL
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}