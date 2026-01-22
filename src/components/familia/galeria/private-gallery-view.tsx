'use client'

import { useState, useEffect, useMemo } from 'react'
import { useGaleriaFamilia, FotoGaleria } from '@/hooks/useGaleriaFamilia'
import { useFamiliaData } from '@/hooks/useFamiliaData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlbumCard } from './album-card'
import { PhotoLightbox } from './photo-lightbox'
import { DownloadBatch } from './download-batch'
import {
  Search,
  Filter,
  Download,
  Share2,
  Grid,
  List,
  Calendar,
  User,
  MapPin,
  Camera,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrivateGalleryViewProps {
  className?: string
  initialView?: 'albums' | 'photos'
}

export function PrivateGalleryView({
  className,
  initialView = 'albums'
}: PrivateGalleryViewProps) {
  const { hijos } = useFamiliaData()
  const {
    albumes,
    albumActual,
    fotos,
    fotosSeleccionadas,
    loading,
    error,
    loadingAlbumes,
    loadingFotos,
    loadingDescarga,
    loadingCompartir,
    cargarAlbumes,
    cargarAlbum,
    seleccionarFoto,
    seleccionarTodas,
    deseleccionarTodas,
    descargarFoto,
    descargarSeleccionadas,
    compartirPorEmail,
    buscarFotos,
    filtrarPorScout,
    refrescar,
    limpiarSeleccion,
    getEstadisticas
  } = useGaleriaFamilia()

  // Función wrapper para adaptar compartirPorEmail a la firma esperada por PhotoLightbox
  const handleShare = async (fotos: FotoGaleria[], email?: string, message?: string): Promise<string | null> => {
    if (!email) return null

    const opciones = {
      email_destino: email,
      mensaje_personal: message,
      expiracion_horas: 72, // 3 días por defecto
      permitir_descarga: true,
      limite_descargas: undefined
    }

    return compartirPorEmail(fotos, opciones)
  }

  // Estados UI
  const [viewMode, setViewMode] = useState<'albums' | 'photos'>(initialView)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedScout, setSelectedScout] = useState<string>('todos')
  const [selectedDateRange, setSelectedDateRange] = useState<string>('todos')
  const [selectedEventType, setSelectedEventType] = useState<string>('todos')
  const [sortBy, setSortBy] = useState<string>('fecha_desc')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Estadísticas
  const stats = getEstadisticas()

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filtrado y ordenamiento
  const filteredAlbumes = useMemo(() => {
    if (!albumes) return []

    let filtered = [...albumes]

    // Filtrar por scout
    if (selectedScout !== 'todos') {
      filtered = filtered.filter(album =>
        album.scouts_etiquetados.includes(parseInt(selectedScout))
      )
    }

    // Filtrar por tipo de evento
    if (selectedEventType !== 'todos') {
      filtered = filtered.filter(album =>
        album.tipo_evento === selectedEventType
      )
    }

    // Filtrar por búsqueda
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(album =>
        album.titulo.toLowerCase().includes(query) ||
        album.descripcion?.toLowerCase().includes(query) ||
        album.lugar_evento?.toLowerCase().includes(query)
      )
    }

    // Filtrar por rango de fechas
    if (selectedDateRange !== 'todos') {
      const ahora = new Date()
      let fechaLimite: Date

      switch (selectedDateRange) {
        case 'semana':
          fechaLimite = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'mes':
          fechaLimite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'trimestre':
          fechaLimite = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case 'año':
          fechaLimite = new Date(ahora.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          fechaLimite = new Date(0)
      }

      filtered = filtered.filter(album =>
        new Date(album.fecha_evento) >= fechaLimite
      )
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'fecha_asc':
          return new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime()
        case 'fecha_desc':
          return new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime()
        case 'titulo_asc':
          return a.titulo.localeCompare(b.titulo)
        case 'titulo_desc':
          return b.titulo.localeCompare(a.titulo)
        case 'fotos_desc':
          return b.fotos_count - a.fotos_count
        case 'fotos_asc':
          return a.fotos_count - b.fotos_count
        default:
          return new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime()
      }
    })

    return filtered
  }, [albumes, selectedScout, selectedEventType, debouncedSearchQuery, selectedDateRange, sortBy])

  // Manejadores
  const handleAlbumClick = async (albumId: string) => {
    await cargarAlbum(albumId)
    setViewMode('photos')
  }

  const handlePhotoClick = (photoIndex: number) => {
    setSelectedPhotoIndex(photoIndex)
    setLightboxOpen(true)
  }

  const handleSearch = async () => {
    if (debouncedSearchQuery.trim()) {
      await buscarFotos(debouncedSearchQuery)
    }
  }

  const handleRefresh = async () => {
    await refrescar()
  }

  const handleSelectAll = () => {
    if (fotosSeleccionadas.length === fotos?.length) {
      deseleccionarTodas()
    } else {
      seleccionarTodas()
    }
  }

  const handleDownloadSelected = () => {
    if (fotosSeleccionadas.length > 0) {
      setShowDownloadModal(true)
    }
  }

  const handleShareSelected = () => {
    if (fotosSeleccionadas.length > 0) {
      setShowShareModal(true)
    }
  }

  const volverAAlbumes = () => {
    setViewMode('albums')
    limpiarSeleccion()
  }

  // Estados de carga
  if (loadingAlbumes && viewMode === 'albums') {
    return (
      <div className={cn("flex flex-col min-h-screen", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Cargando álbumes de fotos...</p>
            <p className="text-sm text-muted-foreground">
              Preparando tus recuerdos scout
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loadingFotos && viewMode === 'photos') {
    return (
      <div className={cn("flex flex-col min-h-screen", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Cargando fotos del álbum...</p>
            <p className="text-sm text-muted-foreground">
              {albumActual?.titulo || 'Preparando las fotos'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className={cn("flex flex-col min-h-screen", className)}>
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle>Error al cargar la galería</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col min-h-screen", className)}>
      {/* Header con estadísticas y controles */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Barra superior */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            {/* Título y navegación */}
            <div className="flex items-center gap-4">
              {viewMode === 'photos' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={volverAAlbumes}
                >
                  <X className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold">
                  {viewMode === 'albums' ? 'Galería Privada Familiar' : albumActual?.titulo}
                </h1>
                {viewMode === 'photos' && albumActual && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(albumActual.fecha_evento).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {albumActual.lugar_evento || 'Sin ubicación'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      {albumActual.fotos_count} fotos
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loadingAlbumes || loadingFotos}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refrescar
              </Button>

              {viewMode === 'albums' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              )}

              {viewMode === 'photos' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={!fotos || fotos.length === 0}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {fotosSeleccionadas.length === fotos?.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadSelected}
                    disabled={fotosSeleccionadas.length === 0 || loadingDescarga}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar ({fotosSeleccionadas.length})
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareSelected}
                    disabled={fotosSeleccionadas.length === 0 || loadingCompartir}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar álbumes, eventos, lugares..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Filtros */}
            {isFilterOpen && viewMode === 'albums' && (
              <div className="flex flex-wrap gap-2">
                <Select value={selectedScout} onValueChange={setSelectedScout}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por scout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos mis hijos</SelectItem>
                    {hijos?.map(hijo => (
                      <SelectItem key={hijo.id} value={hijo.id.toString()}>
                        {hijo.nombre} {hijo.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los eventos</SelectItem>
                    <SelectItem value="campamento">Campamentos</SelectItem>
                    <SelectItem value="actividad">Actividades</SelectItem>
                    <SelectItem value="jornada">Jornadas</SelectItem>
                    <SelectItem value="reunion">Reuniones</SelectItem>
                    <SelectItem value="especial">Eventos especiales</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Siempre</SelectItem>
                    <SelectItem value="semana">Última semana</SelectItem>
                    <SelectItem value="mes">Último mes</SelectItem>
                    <SelectItem value="trimestre">Último trimestre</SelectItem>
                    <SelectItem value="año">Último año</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fecha_desc">Más recientes</SelectItem>
                    <SelectItem value="fecha_asc">Más antiguos</SelectItem>
                    <SelectItem value="titulo_asc">Título A-Z</SelectItem>
                    <SelectItem value="titulo_desc">Título Z-A</SelectItem>
                    <SelectItem value="fotos_desc">Más fotos</SelectItem>
                    <SelectItem value="fotos_asc">Menos fotos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Estadísticas */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {viewMode === 'albums' ? (
                <>
                  <span>{filteredAlbumes.length} álbumes</span>
                  {albumes && albumes.some(a => isAlbumNuevo(a.fecha_evento)) && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {albumes.filter(a => isAlbumNuevo(a.fecha_evento)).length} nuevos
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <span>{fotos?.length || 0} fotos</span>
                  <span>{fotosSeleccionadas.length} seleccionadas</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Vista de álbumes */}
        {viewMode === 'albums' && (
          <>
            {filteredAlbumes.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No se encontraron álbumes</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedScout !== 'todos' || selectedEventType !== 'todos' || selectedDateRange !== 'todos'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Pronto aparecerán aquí las fotos de tus hijos'
                  }
                </p>
                {(searchQuery || selectedScout !== 'todos' || selectedEventType !== 'todos' || selectedDateRange !== 'todos') && (
                  <Button onClick={() => {
                    setSearchQuery('')
                    setSelectedScout('todos')
                    setSelectedEventType('todos')
                    setSelectedDateRange('todos')
                  }}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAlbumes.map(album => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => handleAlbumClick(album.id)}
                    className="h-full"
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Vista de fotos */}
        {viewMode === 'photos' && (
          <>
            {fotos && fotos.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No hay fotos en este álbum</h3>
                <p className="text-muted-foreground">Este álbum aún no tiene fotos disponibles</p>
              </div>
            ) : fotos && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {fotos.map((foto, index) => (
                  <div
                    key={foto.id}
                    className="relative group cursor-pointer"
                    onClick={() => handlePhotoClick(index)}
                  >
                    {/* Foto */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={foto.url_thumbnail}
                        alt={foto.titulo}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Overlay con información */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="text-white text-center p-2">
                        <p className="text-xs font-medium line-clamp-2">{foto.titulo}</p>
                        {foto.etiquetas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 justify-center">
                            {foto.etiquetas.slice(0, 2).map((etiqueta, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {etiqueta.apodo || etiqueta.nombre_completo.split(' ')[0]}
                              </Badge>
                            ))}
                            {foto.etiquetas.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{foto.etiquetas.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Checkbox de selección */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="checkbox"
                        checked={fotosSeleccionadas.some(item => item.foto.id === foto.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          seleccionarFoto(foto.id, e.target.checked)
                        }}
                        className="w-5 h-5 rounded border-2 border-white bg-white/20 text-primary focus:ring-primary focus:ring-2"
                      />
                    </div>

                    {/* Indicador de nuevas fotos */}
                    {isAlbumNuevo(foto.fecha_captura) && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox de fotos */}
      {fotos && lightboxOpen && (
        <PhotoLightbox
          photos={fotos}
          initialIndex={selectedPhotoIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onDownload={descargarFoto}
          onShare={handleShare}
          selectedPhotos={fotosSeleccionadas}
          onPhotoSelect={seleccionarFoto}
        />
      )}

      {/* Modal de descarga masiva */}
      {showDownloadModal && (
        <DownloadBatch
          photos={fotosSeleccionadas.map(item => item.foto)}
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          onDownload={descargarSeleccionadas}
          loading={loadingDescarga}
        />
      )}
    </div>
  )
}

// Función auxiliar
function isAlbumNuevo(fecha: string): boolean {
  const fechaEvento = new Date(fecha)
  const ahora = new Date()
  const horasDiferencia = (ahora.getTime() - fechaEvento.getTime()) / (1000 * 60 * 60)
  return horasDiferencia <= 48
}