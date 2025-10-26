'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { FotoGaleria, FotoSeleccionada } from '@/hooks/useGaleriaFamilia'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Calendar,
  Camera,
  MapPin,
  User,
  Tag,
  Heart,
  Bookmark,
  Send,
  Copy,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoLightboxProps {
  photos: FotoGaleria[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  onDownload?: (foto: FotoGaleria) => Promise<boolean>
  onShare?: (fotos: FotoGaleria[], email?: string, message?: string) => Promise<string | null>
  selectedPhotos?: FotoSeleccionada[]
  onPhotoSelect?: (fotoId: string, selected: boolean) => void
  className?: string
}

export function PhotoLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
  onDownload,
  onShare,
  selectedPhotos = [],
  onPhotoSelect,
  className
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentPhoto = photos[currentIndex]
  const isSelected = selectedPhotos.some(item => item.foto.id === currentPhoto?.id)

  // Reset estado cuando cambia la foto
  useEffect(() => {
    setZoomLevel(1)
    setRotation(0)
    setIsLoading(true)
  }, [currentIndex])

  // Manejar navegación con teclado
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNext()
          break
        case 'Escape':
          e.preventDefault()
          if (showShareDialog) {
            setShowShareDialog(false)
          } else if (isFullscreen) {
            handleFullscreen()
          } else {
            onClose()
          }
          break
        case '+':
        case '=':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
        case '_':
          e.preventDefault()
          handleZoomOut()
          break
        case 'f':
          e.preventDefault()
          handleFullscreen()
          break
        case 'm':
          e.preventDefault()
          setShowMetadata(!showMetadata)
          break
        case 's':
          e.preventDefault()
          handleShare()
          break
        case 'd':
          e.preventDefault()
          handleDownload()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, showShareDialog, isFullscreen, showMetadata])

  // Navegación
  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0) // Loop al inicio
    }
  }, [currentIndex, photos.length])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      setCurrentIndex(photos.length - 1) // Loop al final
    }
  }, [currentIndex, photos.length])

  // Zoom
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1)
    setRotation(0)
  }, [])

  // Rotación
  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360)
  }, [])

  // Pantalla completa
  const handleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  // Descarga
  const handleDownload = useCallback(async () => {
    if (!currentPhoto || !onDownload) return

    const success = await onDownload(currentPhoto)
    if (success) {
      // Opcional: mostrar notificación de éxito
    }
  }, [currentPhoto, onDownload])

  // Compartir
  const handleShare = useCallback(() => {
    setShowShareDialog(true)
  }, [])

  const handleShareSubmit = useCallback(async () => {
    if (!currentPhoto || !onShare) return

    setIsSharing(true)
    try {
      const link = await onShare([currentPhoto], shareEmail, shareMessage)
      if (link) {
        setShareLink(link)
      }
    } finally {
      setIsSharing(false)
    }
  }, [currentPhoto, onShare, shareEmail, shareMessage])

  const handleCopyLink = useCallback(async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }, [shareLink])

  // Selección de foto
  const handleToggleSelect = useCallback(() => {
    if (currentPhoto && onPhotoSelect) {
      onPhotoSelect(currentPhoto.id, !isSelected)
    }
  }, [currentPhoto, isSelected, onPhotoSelect])

  // Like y bookmark (simulados)
  const handleLike = useCallback(() => {
    setIsLiked(!isLiked)
  }, [isLiked])

  const handleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked)
  }, [isBookmarked])

  // Manejar gestos táctiles para móvil
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    })
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    }

    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y

    // Detectar swipe horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        handlePrevious() // Swipe derecha - foto anterior
      } else {
        handleNext() // Swipe izquierda - foto siguiente
      }
    }

    setTouchStart(null)
  }, [touchStart, handleNext, handlePrevious])

  if (!currentPhoto) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none overflow-hidden">
        {/* Container principal */}
        <div
          ref={containerRef}
          className={cn(
            "relative w-full h-full flex flex-col lg:flex-row",
            className
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Área de la imagen */}
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}

            {/* Imagen principal */}
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <img
                ref={imageRef}
                src={currentPhoto.url}
                alt={currentPhoto.titulo}
                className={cn(
                  "max-w-full max-h-full object-contain transition-transform select-none",
                  `scale-${zoomLevel}`,
                  `rotate-${rotation}`
                )}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  cursor: zoomLevel > 1 ? 'move' : 'default'
                }}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                draggable={false}
              />
            </div>

            {/* Controles de navegación */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/20"
              onClick={handlePrevious}
              disabled={photos.length <= 1}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/20"
              onClick={handleNext}
              disabled={photos.length <= 1}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Controles de zoom */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="bg-black/50 rounded-lg p-1 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-white text-xs px-2 min-w-[3rem] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={handleZoomReset}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Información de la foto */}
            <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-white max-w-sm">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                {currentPhoto.titulo}
              </h3>
              {currentPhoto.descripcion && (
                <p className="text-xs opacity-90 line-clamp-2">
                  {currentPhoto.descripcion}
                </p>
              )}
            </div>

            {/* Botón cerrar */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-white/20"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Botones de acción */}
            <div className="absolute top-16 right-4 flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                onClick={handleLike}
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-red-500 text-red-500")} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                onClick={handleBookmark}
              >
                <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-yellow-500 text-yellow-500")} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                onClick={handleToggleSelect}
              >
                <Tag className={cn("w-5 h-5", isSelected && "fill-blue-500 text-blue-500")} />
              </Button>

              <Separator className="w-8 mx-auto bg-white/20" />

              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                onClick={handleDownload}
              >
                <Download className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                onClick={handleFullscreen}
              >
                <Maximize2 className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                onClick={() => setShowMetadata(!showMetadata)}
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>

            {/* Indicador de progreso */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 rounded-full px-3 py-1 text-white text-xs">
                {currentIndex + 1} / {photos.length}
              </div>
            )}
          </div>

          {/* Panel lateral de metadatos */}
          {showMetadata && (
            <div className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Título y descripción */}
                <div>
                  <h2 className="text-lg font-bold mb-2">{currentPhoto.titulo}</h2>
                  {currentPhoto.descripcion && (
                    <p className="text-sm text-gray-600">{currentPhoto.descripcion}</p>
                  )}
                </div>

                <Separator />

                {/* Información básica */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Fecha:</span>
                    <span className="text-gray-600">
                      {new Date(currentPhoto.fecha_captura).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Camera className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Tamaño:</span>
                    <span className="text-gray-600">{currentPhoto.tamaño_formato}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Camera className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Formato:</span>
                    <span className="text-gray-600">{currentPhoto.tipo}</span>
                  </div>
                </div>

                {/* Metadata de la cámara */}
                {currentPhoto.metadata && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">Datos de la cámara</h3>

                      {currentPhoto.metadata.camara && (
                        <div className="flex items-center gap-2 text-sm">
                          <Camera className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Cámara:</span>
                          <span className="text-gray-600">{currentPhoto.metadata.camara}</span>
                        </div>
                      )}

                      {currentPhoto.metadata.lente && (
                        <div className="flex items-center gap-2 text-sm">
                          <Camera className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Lente:</span>
                          <span className="text-gray-600">{currentPhoto.metadata.lente}</span>
                        </div>
                      )}

                      {currentPhoto.metadata.apertura && (
                        <div className="flex items-center gap-2 text-sm">
                          <Camera className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Apertura:</span>
                          <span className="text-gray-600">{currentPhoto.metadata.apertura}</span>
                        </div>
                      )}

                      {currentPhoto.metadata.velocidad && (
                        <div className="flex items-center gap-2 text-sm">
                          <Camera className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Velocidad:</span>
                          <span className="text-gray-600">{currentPhoto.metadata.velocidad}</span>
                        </div>
                      )}

                      {currentPhoto.metadata.iso && (
                        <div className="flex items-center gap-2 text-sm">
                          <Camera className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">ISO:</span>
                          <span className="text-gray-600">{currentPhoto.metadata.iso}</span>
                        </div>
                      )}

                      {currentPhoto.metadata.gps_lat && currentPhoto.metadata.gps_lng && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">GPS:</span>
                          <span className="text-gray-600">
                            {currentPhoto.metadata.gps_lat.toFixed(6)}, {currentPhoto.metadata.gps_lng.toFixed(6)}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Scouts etiquetados */}
                {currentPhoto.etiquetas.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Personas en la foto
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {currentPhoto.etiquetas.map((etiqueta, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {etiqueta.apodo || etiqueta.nombre_completo.split(' ')[0]}
                            {etiqueta.confianza && (
                              <span className="ml-1 text-xs opacity-70">
                                ({Math.round(etiqueta.confianza)}%)
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal de compartir */}
        {showShareDialog && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-semibold">Compartir foto</h3>

              {shareLink ? (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">Enlace generado correctamente</p>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded-lg">
                    <Input
                      value={shareLink}
                      readOnly
                      className="flex-1 border-0 bg-transparent"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                    >
                      {linkCopied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowShareDialog(false)
                      setShareLink('')
                    }}
                  >
                    Cerrar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email del destinatario (opcional)
                    </label>
                    <Input
                      type="email"
                      placeholder="email@ejemplo.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mensaje personal (opcional)
                    </label>
                    <Textarea
                      placeholder="Escribe un mensaje..."
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowShareDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleShareSubmit}
                      disabled={isSharing}
                    >
                      {isSharing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {shareEmail ? 'Enviar por email' : 'Generar enlace'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}