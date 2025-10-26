'use client'

import { useState } from 'react'
import { AlbumPrivado } from '@/hooks/useGaleriaFamilia'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import {
  Calendar,
  MapPin,
  Camera,
  Users,
  Clock,
  Star,
  Eye,
  Download,
  Share2,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlbumCardProps {
  album: AlbumPrivado
  onClick: () => void
  className?: string
  showActions?: boolean
  compact?: boolean
}

export function AlbumCard({
  album,
  onClick,
  className,
  showActions = true,
  compact = false
}: AlbumCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Determinar si el álbum es nuevo (últimas 48 horas)
  const esNuevo = isAlbumNuevo(album.fecha_evento)

  // Obtener color según tipo de evento
  const getEventTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'campamento':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'actividad':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'jornada':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'reunion':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'especial':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Obtener icono según tipo de evento
  const getEventTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'campamento':
        return '🏕️'
      case 'actividad':
        return '🎯'
      case 'jornada':
        return '🎉'
      case 'reunion':
        return '👥'
      case 'especial':
        return '⭐'
      default:
        return '📸'
    }
  }

  // Formatear fecha de evento
  const formatFechaEvento = (fecha: string) => {
    const fechaEvento = new Date(fecha)
    const ahora = new Date()
    const diasDiferencia = Math.floor((ahora.getTime() - fechaEvento.getTime()) / (1000 * 60 * 60 * 24))

    if (diasDiferencia === 0) return 'Hoy'
    if (diasDiferencia === 1) return 'Ayer'
    if (diasDiferencia < 7) return `Hace ${diasDiferencia} días`
    if (diasDiferencia < 30) return `Hace ${Math.floor(diasDiferencia / 7)} semanas`
    if (diasDiferencia < 365) return `Hace ${Math.floor(diasDiferencia / 30)} meses`
    return `Hace ${Math.floor(diasDiferencia / 365)} años`
  }

  // Formatear fecha completa
  const formatFechaCompleta = (fecha: string) => {
    const fechaEvento = new Date(fecha)
    return fechaEvento.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Obtener scouts etiquetados (limitados para display)
  const scoutsDisplay = album.scouts_etiquetados.slice(0, 3)

  if (compact) {
    // Versión compacta para grids pequeños
    return (
      <div
        className={cn(
          "group relative bg-card rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
          className
        )}
        onClick={onClick}
      >
        {/* Imagen miniatura */}
        <div className="aspect-video relative">
          {!imageError && album.thumbnail_url ? (
            <LazyImage
              src={album.thumbnail_url}
              alt={album.titulo}
              fill
              className="object-cover"
              onLoad={() => setIsLoading(false)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          {/* Overlay de información */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-2 left-2 right-2 text-white">
              <h3 className="font-semibold text-sm line-clamp-1">{album.titulo}</h3>
              <div className="flex items-center gap-2 text-xs opacity-90">
                <Calendar className="w-3 h-3" />
                <span>{formatFechaEvento(album.fecha_evento)}</span>
              </div>
            </div>
          </div>

          {/* Indicadores */}
          <div className="absolute top-2 left-2 flex gap-1">
            {esNuevo && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-0">
                Nuevo
              </Badge>
            )}
            <Badge className={cn("text-xs px-2 py-0", getEventTypeColor(album.tipo_evento))}>
              {getEventTypeIcon(album.tipo_evento)}
            </Badge>
          </div>

          {/* Contador de fotos */}
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="text-xs bg-black/50 text-white">
              <Camera className="w-3 h-3 mr-1" />
              {formatCount(album.fotos_count)}
            </Badge>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Versión completa con toda la información
  return (
    <Card
      className={cn(
        "group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] bg-card",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Header con imagen */}
        <div className="relative">
          {/* Imagen del álbum */}
          <div className="aspect-video relative">
            {!imageError && album.thumbnail_url ? (
              <LazyImage
                src={album.thumbnail_url}
                alt={album.titulo}
                fill
                className="object-cover"
                onLoad={() => setIsLoading(false)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-4xl opacity-50">
                    {getEventTypeIcon(album.tipo_evento)}
                  </div>
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto" />
                </div>
              </div>
            )}

            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Indicadores superiores */}
            <div className="absolute top-3 left-3 flex gap-2">
              {esNuevo && (
                <Badge className="bg-green-500 text-white text-xs px-2 py-1 border-0">
                  <Star className="w-3 h-3 mr-1" />
                  Nuevo
                </Badge>
              )}
              <Badge className={cn("text-xs px-2 py-1 border", getEventTypeColor(album.tipo_evento))}>
                {album.tipo_evento.charAt(0).toUpperCase() + album.tipo_evento.slice(1)}
              </Badge>
            </div>

            {/* Contador de fotos */}
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-black/50 text-white text-xs px-2 py-1 border-0">
                <Camera className="w-3 h-3 mr-1" />
                {formatCount(album.fotos_count)}
              </Badge>
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Título sobre imagen */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-bold text-lg line-clamp-2 mb-1">
              {album.titulo}
            </h3>
            {album.descripcion && (
              <p className="text-sm opacity-90 line-clamp-2">
                {album.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Contenido del álbum */}
        <div className="p-4 space-y-3">
          {/* Información de fecha y ubicación */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatFechaEvento(album.fecha_evento)}</span>
            </div>
            <div className="text-xs">
              {formatFechaCompleta(album.fecha_evento)}
            </div>
          </div>

          {album.lugar_evento && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{album.lugar_evento}</span>
            </div>
          )}

          {/* Scouts etiquetados */}
          {scoutsDisplay.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>
                  {album.etiquetas_count} scout{album.etiquetas_count !== 1 ? 's' : ''} etiquetado{album.etiquetas_count !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {scoutsDisplay.map((scoutId, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    Scout {scoutId}
                  </Badge>
                ))}
                {album.scouts_etiquetados.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{album.scouts_etiquetados.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Sección */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="font-medium">{album.seccion}</span>
          </div>

          {/* Footer con acciones */}
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Actualizado {formatFechaEvento(album.updated_at)}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Hover overlay con acciones rápidas */}
        {showActions && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
            <Button
              variant="secondary"
              size="sm"
              className="pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation()
                // Aquí podrías añadir una acción rápida
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation()
                // Aquí podrías añadir acción rápida de descarga
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation()
                // Aquí podrías añadir acción rápida de compartir
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Funciones auxiliares
function isAlbumNuevo(fecha: string): boolean {
  const fechaEvento = new Date(fecha)
  const ahora = new Date()
  const horasDiferencia = (ahora.getTime() - fechaEvento.getTime()) / (1000 * 60 * 60)
  return horasDiferencia <= 48
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}