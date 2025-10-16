'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Eye,
  Edit3,
  ExternalLink,
  Maximize2,
  RefreshCw,
  Save,
  X,
  MousePointer2,
  Zap,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Loader2
} from "lucide-react"
import { getAuthToken, makeAuthenticatedRequest } from "@/lib/auth-utils"

interface PageData {
  id: number
  titulo: string
  slug: string
  contenido: string
  resumen?: string
  estado: 'borrador' | 'publicada' | 'archivada'
  fecha_actualizacion: string
}

interface PagePreviewMiniatureProps {
  pageData: PageData
  onUpdate?: (updatedPage: PageData) => void
  showControls?: boolean
  scale?: number
  className?: string
}

interface EditableElement {
  id: string
  type: 'text' | 'textarea' | 'image'
  label: string
  content: string
  selector: string
  maxLength?: number
}

export function PagePreviewMiniature({
  pageData,
  onUpdate,
  showControls = true,
  scale = 0.25,
  className = ""
}: PagePreviewMiniatureProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingElement, setEditingElement] = useState<EditableElement | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)
  const [realPageData, setRealPageData] = useState<any>(null)
  const [isLoadingRealPage, setIsLoadingRealPage] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Load real page data for preview
  useEffect(() => {
    loadRealPageData()
  }, [pageData.slug])

  const loadRealPageData = async () => {
    try {
      setIsLoadingRealPage(true)

      // Map database slugs to section data
      const sectionMapping: { [key: string]: string } = {
        'secciones-castores': 'castores',
        'secciones-manada': 'lobatos',
        'secciones-tropa': 'tropa',
        'secciones-pioneros': 'pioneros',
        'secciones-rutas': 'rutas'
      }

      const sectionType = sectionMapping[pageData.slug]
      if (sectionType) {
        // For section pages, we'll use the existing template structure
        setRealPageData({
          type: 'section',
          sectionType,
          // We'll inject the database content into the template
          customContent: parseMarkdownContent(pageData.contenido)
        })
      } else {
        // For regular pages, use markdown content
        setRealPageData({
          type: 'markdown',
          title: pageData.titulo,
          content: parseMarkdownContent(pageData.contenido)
        })
      }
    } catch (error) {
      console.error('Error loading real page data:', error)
      toast({
        title: '❌ Error',
        description: 'No se pudo cargar la vista previa de la página',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingRealPage(false)
    }
  }

  const parseMarkdownContent = (markdown: string) => {
    // Convert markdown to structured data for preview
    const sections = markdown.split('\n## ').map((section, index) => {
      const lines = section.split('\n')
      const title = index === 0 ? lines[0].replace('# ', '') : lines[0]
      const content = lines.slice(1).join('\n').trim()

      return {
        title,
        content,
        type: detectSectionType(title, content)
      }
    })

    return sections
  }

  const detectSectionType = (title: string, content: string) => {
    if (title.toLowerCase().includes('actividad') || content.includes('🎮') || content.includes('🌳')) {
      return 'activities'
    }
    if (title.toLowerCase().includes('metodolog') || title.toLowerCase().includes('método')) {
      return 'methodology'
    }
    if (title.toLowerCase().includes('equipo') || title.toLowerCase().includes('team')) {
      return 'team'
    }
    if (title.toLowerCase().includes('sobre') || title.toLowerCase().includes('quién')) {
      return 'about'
    }
    return 'content'
  }

  const getPreviewDimensions = () => {
    const baseDimensions = {
      desktop: { width: 1200, height: 800 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    }

    const dimensions = baseDimensions[previewMode]
    return {
      width: dimensions.width * scale,
      height: dimensions.height * scale
    }
  }

  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    if (!showControls) return

    event.preventDefault()
    event.stopPropagation()

    // Find the element data based on the clicked area
    const editableElements = getEditableElements()
    const element = editableElements.find(el => el.id === elementId)

    if (element) {
      setEditingElement(element)
      setIsEditing(true)
    }
  }

  const getEditableElements = (): EditableElement[] => {
    if (!realPageData) return []

    const elements: EditableElement[] = []

    if (realPageData.type === 'section') {
      elements.push(
        {
          id: 'hero-title',
          type: 'text',
          label: 'Título principal',
          content: pageData.titulo,
          selector: '[data-edit="hero-title"]',
          maxLength: 100
        },
        {
          id: 'hero-subtitle',
          type: 'text',
          label: 'Subtítulo',
          content: 'Lema y rango de edad',
          selector: '[data-edit="hero-subtitle"]',
          maxLength: 150
        }
      )

      // Add elements for each section from parsed content
      realPageData.customContent?.forEach((section: any, index: number) => {
        elements.push({
          id: `section-${index}`,
          type: section.content.length > 200 ? 'textarea' : 'text',
          label: `Sección: ${section.title}`,
          content: section.content,
          selector: `[data-section="${index}"]`,
          maxLength: section.type === 'text' ? 200 : 1000
        })
      })
    } else {
      // For markdown pages
      elements.push({
        id: 'page-title',
        type: 'text',
        label: 'Título de la página',
        content: realPageData.title,
        selector: '[data-edit="page-title"]',
        maxLength: 100
      })

      realPageData.content?.forEach((section: any, index: number) => {
        elements.push({
          id: `content-${index}`,
          type: 'textarea',
          label: section.title || `Contenido ${index + 1}`,
          content: section.content,
          selector: `[data-content="${index}"]`,
          maxLength: 2000
        })
      })
    }

    return elements
  }

  const handleSaveElement = async () => {
    if (!editingElement) return

    try {
      setIsLoading(true)

      // Update the content in the database
      const updatedContent = updateContentWithElement(pageData.contenido, editingElement)

      const token = getAuthToken()
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const response = await makeAuthenticatedRequest(
        `/api/paginas/${pageData.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            contenido: updatedContent,
            fecha_actualizacion: new Date().toISOString()
          })
        }
      )

      if (!response.ok) {
        throw new Error('Error al actualizar la página')
      }

      const result = await response.json()
      if (result.success) {
        onUpdate?.(result.data)
        await loadRealPageData() // Reload preview

        toast({
          title: '✅ Actualizado',
          description: `Se ha actualizado "${editingElement.label}" correctamente`,
        })
      }
    } catch (error) {
      console.error('Error saving element:', error)
      toast({
        title: '❌ Error',
        description: 'No se pudo guardar el cambio',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
      setIsEditing(false)
      setEditingElement(null)
    }
  }

  const updateContentWithElement = (originalContent: string, element: EditableElement) => {
    // This is a simplified update - in a real implementation you'd need more sophisticated
    // content parsing and updating based on the element type and position

    if (element.id === 'page-title') {
      return originalContent.replace(/^# .*$/m, `# ${element.content}`)
    }

    // For other elements, you'd implement specific update logic
    // This could involve parsing the markdown structure and updating specific sections
    return originalContent
  }

  const PreviewContent = () => {
    if (isLoadingRealPage) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="ml-2">Cargando vista previa...</span>
        </div>
      )
    }

    if (!realPageData) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Vista previa no disponible</p>
          </div>
        </div>
      )
    }

    return (
      <div
        className="w-full h-full bg-white overflow-hidden rounded-lg border"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: getPreviewDimensions().width / scale,
          height: getPreviewDimensions().height / scale
        }}
      >
        {realPageData.type === 'section' ? (
          <SectionPreview
            sectionType={realPageData.sectionType}
            customContent={realPageData.customContent}
            onElementClick={handleElementClick}
            hoveredElement={hoveredElement}
            onElementHover={setHoveredElement}
          />
        ) : (
          <MarkdownPreview
            title={realPageData.title}
            content={realPageData.content}
            onElementClick={handleElementClick}
            hoveredElement={hoveredElement}
            onElementHover={setHoveredElement}
          />
        )}

        {/* Hover overlay for editable elements */}
        {showControls && hoveredElement && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              Click para editar: {hoveredElement}
            </div>
          </div>
        )}
      </div>
    )
  }

  const dimensions = getPreviewDimensions()

  return (
    <>
      <Card className={`border-red-200 dark:border-red-800 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm text-red-900 dark:text-red-100 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vista Previa Miniatura
              </CardTitle>
              <CardDescription className="text-xs">
                {pageData.titulo} • /{pageData.slug}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant={pageData.estado === 'publicada' ? 'default' : 'outline'}
                className="text-xs"
              >
                {pageData.estado}
              </Badge>
              {showControls && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadRealPageData}
                  disabled={isLoadingRealPage}
                  className="h-6 w-6 p-0"
                  title="Actualizar vista previa"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingRealPage ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>

          {showControls && (
            <div className="flex items-center gap-1 pt-2">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
                className="h-6 px-2 text-xs"
              >
                <Monitor className="h-3 w-3" />
              </Button>
              <Button
                variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('tablet')}
                className="h-6 px-2 text-xs"
              >
                <Tablet className="h-3 w-3" />
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
                className="h-6 px-2 text-xs"
              >
                <Smartphone className="h-3 w-3" />
              </Button>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => window.open(`/${pageData.slug}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="pb-3">
          <div
            className="relative bg-gray-50 rounded-lg overflow-hidden border"
            style={{
              width: dimensions.width,
              height: dimensions.height
            }}
          >
            <PreviewContent />

            {/* Click hint overlay */}
            {showControls && !hoveredElement && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-white/90 rounded-lg px-3 py-2 text-xs text-center shadow-lg">
                  <MousePointer2 className="h-4 w-4 mx-auto mb-1" />
                  <p>Haz clic en cualquier elemento para editarlo</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Escala: {Math.round(scale * 100)}%</span>
            <span>Actualizado: {new Date(pageData.fecha_actualizacion).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Editando: {editingElement?.label}
            </DialogTitle>
            <DialogDescription>
              Modifica el contenido de este elemento y se actualizará automáticamente en la página real.
            </DialogDescription>
          </DialogHeader>

          {editingElement && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="element-content">Contenido</Label>
                {editingElement.type === 'textarea' ? (
                  <Textarea
                    id="element-content"
                    value={editingElement.content}
                    onChange={(e) => setEditingElement({
                      ...editingElement,
                      content: e.target.value
                    })}
                    rows={6}
                    maxLength={editingElement.maxLength}
                    className="mt-1"
                  />
                ) : (
                  <Input
                    id="element-content"
                    value={editingElement.content}
                    onChange={(e) => setEditingElement({
                      ...editingElement,
                      content: e.target.value
                    })}
                    maxLength={editingElement.maxLength}
                    className="mt-1"
                  />
                )}
                {editingElement.maxLength && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {editingElement.content.length} / {editingElement.maxLength} caracteres
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveElement}
                  disabled={isLoading || !editingElement.content.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Preview components for different page types
const SectionPreview = ({
  sectionType,
  customContent,
  onElementClick,
  hoveredElement,
  onElementHover
}: {
  sectionType: string
  customContent: any[]
  onElementClick: (elementId: string, event: React.MouseEvent) => void
  hoveredElement: string | null
  onElementHover: (elementId: string | null) => void
}) => {
  const sectionColors = {
    castores: { from: 'from-orange-400', to: 'to-orange-600', accent: 'orange' },
    lobatos: { from: 'from-yellow-400', to: 'to-yellow-600', accent: 'yellow' },
    tropa: { from: 'from-green-400', to: 'to-green-600', accent: 'green' },
    pioneros: { from: 'from-red-400', to: 'to-red-600', accent: 'red' },
    rutas: { from: 'from-green-600', to: 'to-green-800', accent: 'green' }
  }

  const colors = sectionColors[sectionType as keyof typeof sectionColors] || sectionColors.castores

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Hero Section */}
      <div
        className={`bg-gradient-to-br ${colors.from} ${colors.to} text-white p-6 text-center cursor-pointer hover:bg-opacity-90 transition-colors`}
        data-edit="hero-title"
        onClick={(e) => onElementClick('hero-title', e)}
        onMouseEnter={() => onElementHover('hero-title')}
        onMouseLeave={() => onElementHover(null)}
        style={{
          outline: hoveredElement === 'hero-title' ? '2px solid #fff' : 'none',
          outlineOffset: '2px'
        }}
      >
        <div className="text-2xl mb-2">🦫</div>
        <h1 className="text-lg font-bold mb-2">
          {customContent[0]?.title || `${sectionType.charAt(0).toUpperCase()}${sectionType.slice(1)}`}
        </h1>
        <p className="text-sm opacity-90">
          {customContent[0]?.content?.substring(0, 100) || 'Descripción de la sección scout'}...
        </p>
      </div>

      {/* Content Sections */}
      <div className="p-4 space-y-4">
        {customContent.slice(1).map((section, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
            data-section={index}
            onClick={(e) => onElementClick(`section-${index}`, e)}
            onMouseEnter={() => onElementHover(`section-${index}`)}
            onMouseLeave={() => onElementHover(null)}
            style={{
              outline: hoveredElement === `section-${index}` ? '2px solid #ef4444' : 'none',
              outlineOffset: '2px'
            }}
          >
            <h3 className="font-medium text-sm mb-1">{section.title}</h3>
            <p className="text-xs text-gray-600 line-clamp-2">
              {section.content.substring(0, 150)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

const MarkdownPreview = ({
  title,
  content,
  onElementClick,
  hoveredElement,
  onElementHover
}: {
  title: string
  content: any[]
  onElementClick: (elementId: string, event: React.MouseEvent) => void
  hoveredElement: string | null
  onElementHover: (elementId: string | null) => void
}) => {
  return (
    <div className="w-full h-full overflow-y-auto p-4">
      <h1
        className="text-xl font-bold mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
        data-edit="page-title"
        onClick={(e) => onElementClick('page-title', e)}
        onMouseEnter={() => onElementHover('page-title')}
        onMouseLeave={() => onElementHover(null)}
        style={{
          outline: hoveredElement === 'page-title' ? '2px solid #ef4444' : 'none',
          outlineOffset: '2px'
        }}
      >
        {title}
      </h1>

      <div className="space-y-3">
        {content.map((section, index) => (
          <div
            key={index}
            className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            data-content={index}
            onClick={(e) => onElementClick(`content-${index}`, e)}
            onMouseEnter={() => onElementHover(`content-${index}`)}
            onMouseLeave={() => onElementHover(null)}
            style={{
              outline: hoveredElement === `content-${index}` ? '2px solid #ef4444' : 'none',
              outlineOffset: '2px'
            }}
          >
            {section.title && (
              <h2 className="text-sm font-semibold mb-1">{section.title}</h2>
            )}
            <p className="text-xs text-gray-600 line-clamp-3">
              {section.content.substring(0, 200)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PagePreviewMiniature