'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, RefreshCw, Download, FileText, ZoomIn, ZoomOut, Maximize2, RotateCw } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"

// Constantes de zoom
const ZOOM_MIN = 25
const ZOOM_MAX = 200
const ZOOM_STEP = 25
const ZOOM_DEFAULT = 100 // Por defecto 100% para mostrar documento completo
const ZOOM_STORAGE_KEY = 'osyris_document_zoom_preference'

interface DocumentoViewerModalProps {
  isOpen: boolean
  onClose: () => void
  documento: {
    name: string
    webViewLink?: string
    id?: string
  } | null
}

export function DocumentoViewerModal({ isOpen, onClose, documento }: DocumentoViewerModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [isPdf, setIsPdf] = useState(true)
  const [mimeType, setMimeType] = useState<string>('')
  const [zoomLevel, setZoomLevel] = useState(ZOOM_DEFAULT)
  const [isFitWidth, setIsFitWidth] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cargar preferencia de zoom desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedZoom = localStorage.getItem(ZOOM_STORAGE_KEY)
      if (savedZoom) {
        const parsed = parseInt(savedZoom, 10)
        if (!isNaN(parsed) && parsed >= ZOOM_MIN && parsed <= ZOOM_MAX) {
          setZoomLevel(parsed)
        }
      }
    }
  }, [])

  // Guardar preferencia de zoom en localStorage
  const saveZoomPreference = useCallback((zoom: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ZOOM_STORAGE_KEY, zoom.toString())
    }
  }, [])

  // Controles de zoom
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev + ZOOM_STEP, ZOOM_MAX)
      saveZoomPreference(newZoom)
      setIsFitWidth(false)
      return newZoom
    })
  }, [saveZoomPreference])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - ZOOM_STEP, ZOOM_MIN)
      saveZoomPreference(newZoom)
      setIsFitWidth(false)
      return newZoom
    })
  }, [saveZoomPreference])

  const handleZoomReset = useCallback(() => {
    setZoomLevel(ZOOM_DEFAULT)
    saveZoomPreference(ZOOM_DEFAULT)
    setIsFitWidth(false)
  }, [saveZoomPreference])

  const handleFitWidth = useCallback(() => {
    setIsFitWidth(prev => !prev)
    if (!isFitWidth) {
      setZoomLevel(ZOOM_DEFAULT)
    }
  }, [isFitWidth])

  const handleRetry = useCallback(() => {
    setError(null)
    setLoading(true)
    setBlobUrl(null)
    setIsPdf(true)
    setRetryKey(prev => prev + 1)
  }, [])

  // Extraer fileId de diferentes formatos de URL
  const getFileId = (url: string) => {
    // Formato webViewLink: /d/ID/
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match) return match[1]

    // Formato download: ?id=ID o &id=ID
    match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (match) return match[1]

    return null
  }

  useEffect(() => {
    if (!isOpen || !documento) {
      setBlobUrl(null)
      setLoading(true)
      setError(null)
      setIsPdf(true)
      setMimeType('')
      return
    }

    const fetchDocument = async () => {
      const fileId = documento.id || getFileId(documento.webViewLink || '')
      if (!fileId) {
        setError('No se pudo obtener el ID del archivo')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/drive/file/${fileId}/preview`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          // Intentar leer el mensaje de error del servidor
          try {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Error al cargar el documento')
          } catch {
            throw new Error('Error al cargar el documento')
          }
        }

        // Verificar que el content-type sea PDF o similar
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          // El servidor devolvió JSON en lugar de un archivo
          const errorData = await response.json()
          throw new Error(errorData.message || 'El servidor no pudo obtener el documento')
        }

        const blob = await response.blob()

        // Verificar que el blob tenga contenido
        if (blob.size === 0) {
          throw new Error('El documento está vacío')
        }

        // Verificar el tipo de contenido
        const blobType = blob.type || contentType || ''
        setMimeType(blobType)

        // Determinar si es PDF o imagen
        const isPdfFile = blobType.includes('pdf')
        const isImage = blobType.includes('image/')
        setIsPdf(isPdfFile || isImage)

        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
      } catch (err) {
        console.error('Error fetching document:', err)
        setError(err instanceof Error ? err.message : 'No se pudo cargar el documento')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [isOpen, documento, retryKey])

  // Manejar atajos de teclado para zoom
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        handleZoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        handleZoomReset()
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        handleFitWidth()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleZoomIn, handleZoomOut, handleZoomReset, handleFitWidth])

  if (!documento) return null

  // Calcular estilos de zoom para imágenes
  // Por defecto (100%), la imagen se ajusta al contenedor sin desbordar
  // Al hacer zoom, la imagen crece y permite scroll
  const getImageZoomStyles = (): React.CSSProperties => {
    if (isFitWidth) {
      return {
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: 'none',
        objectFit: 'contain' as const
      }
    }
    // Al 100%, la imagen se ajusta completamente al contenedor
    // Por encima de 100%, la imagen crece proporcionalmente
    if (zoomLevel <= 100) {
      return {
        maxWidth: '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto',
        objectFit: 'contain' as const
      }
    }
    // Zoom superior al 100%: la imagen crece y permite scroll
    return {
      width: `${zoomLevel}%`,
      height: 'auto',
      maxWidth: 'none',
      maxHeight: 'none',
      objectFit: 'contain' as const
    }
  }

  // Verificar si es imagen
  const isImage = mimeType.includes('image/')

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (blobUrl) URL.revokeObjectURL(blobUrl)
        setBlobUrl(null)
        setLoading(true)
        setError(null)
        setIsPdf(true)
        setMimeType('')
        setIsFitWidth(false)
      }
      onClose()
    }}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
        {/* Header con titulo y controles de zoom */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <DialogHeader className="flex-1 min-w-0">
            <DialogTitle className="text-lg truncate pr-4">{documento.name}</DialogTitle>
          </DialogHeader>

          {/* Controles de zoom - solo mostrar cuando el documento esta cargado */}
          {blobUrl && !error && isPdf && (
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomOut}
                disabled={zoomLevel <= ZOOM_MIN}
                title="Reducir zoom (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <span className="text-sm font-medium min-w-[4rem] text-center">
                {isFitWidth ? 'Ajustar' : `${zoomLevel}%`}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomIn}
                disabled={zoomLevel >= ZOOM_MAX}
                title="Aumentar zoom (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleFitWidth}
                title="Ajustar al ancho (W)"
              >
                <Maximize2 className={`h-4 w-4 ${isFitWidth ? 'text-blue-600' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomReset}
                title="Restablecer zoom (0)"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div
          ref={containerRef}
          className="flex-1 bg-muted overflow-auto relative"
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
              <span className="ml-2">Cargando documento...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 p-4">
              <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-3" />
              <p className="text-red-500 dark:text-red-400 text-center mb-4">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Volver a cargar
              </Button>
            </div>
          )}

          {blobUrl && !error && isPdf && (
            <>
              {isImage ? (
                /* Visor de imagenes con zoom */
                <div className={`flex items-center justify-center p-4 ${zoomLevel <= 100 ? 'h-full' : 'min-h-full'}`}>
                  <img
                    src={blobUrl}
                    alt={documento.name}
                    className="transition-all duration-200"
                    style={getImageZoomStyles()}
                    draggable={false}
                  />
                </div>
              ) : (
                /* Visor de PDF con zoom aplicado via query params */
                <iframe
                  src={`${blobUrl}#zoom=${zoomLevel}&view=FitH`}
                  className="w-full h-full border-0"
                  title={documento.name}
                  style={{
                    transform: isFitWidth ? 'none' : `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top left',
                    width: isFitWidth ? '100%' : `${10000 / zoomLevel}%`,
                    height: isFitWidth ? '100%' : `${10000 / zoomLevel}%`
                  }}
                />
              )}
            </>
          )}

          {blobUrl && !error && !isPdf && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background p-4">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-2">
                Este archivo no se puede previsualizar directamente
              </p>
              <p className="text-sm text-muted-foreground/80 mb-4">
                Tipo: {mimeType || 'Desconocido'}
              </p>
              <Button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = blobUrl
                  link.download = documento.name
                  link.click()
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar archivo
              </Button>
            </div>
          )}
        </div>

        {/* Footer con atajos de teclado */}
        {blobUrl && !error && isPdf && (
          <div className="px-6 py-2 border-t bg-muted/50 text-xs text-muted-foreground flex items-center justify-center gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-background rounded border">+</kbd> / <kbd className="px-1.5 py-0.5 bg-background rounded border">-</kbd> Zoom</span>
            <span><kbd className="px-1.5 py-0.5 bg-background rounded border">0</kbd> Restablecer</span>
            <span><kbd className="px-1.5 py-0.5 bg-background rounded border">W</kbd> Ajustar ancho</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
