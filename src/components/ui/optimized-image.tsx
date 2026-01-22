"use client"

import Image, { ImageProps } from 'next/image'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// Placeholder blur base64 (gris claro universal)
const DEFAULT_BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAHhAAAgEEAwEAAAAAAAAAAAAAAQIDAAQFERIhMUH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABoRAAIDAQEAAAAAAAAAAAAAAAABAgMRITH/2gAMAwEAAhEDEQA/AK+JwuPurSKZrq4VnUMQJQAM+deSm/xRFKrxqCQdKD1H2p7KUqaqTPB//9k='

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  fallbackSrc?: string
  showPlaceholder?: boolean
  containerClassName?: string
  onImageLoad?: () => void
  onImageError?: () => void
}

/**
 * OptimizedImage - Componente de imagen optimizado con Next.js Image
 *
 * Caracteristicas:
 * - Optimizacion automatica de imagenes (webp, avif)
 * - Lazy loading nativo
 * - Placeholder blur para evitar CLS
 * - Fallback en caso de error
 * - Soporte para imagenes locales y remotas
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  showPlaceholder = true,
  containerClassName,
  className,
  onImageLoad,
  onImageError,
  fill,
  width,
  height,
  sizes,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onImageLoad?.()
  }, [onImageLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
      setHasError(false)
    }
    onImageError?.()
  }, [fallbackSrc, imageSrc, onImageError])

  // Determinar si es una URL externa o local
  const isExternalUrl = typeof imageSrc === 'string' &&
    (imageSrc.startsWith('http://') || imageSrc.startsWith('https://'))

  // Para imagenes locales, usar blur placeholder
  // Para externas, solo si showPlaceholder es true
  const shouldShowPlaceholder = showPlaceholder && !priority

  // Determinar sizes si no se proporciona y fill esta activo
  const defaultSizes = fill && !sizes
    ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    : sizes

  return (
    <div className={cn(
      "relative overflow-hidden",
      fill && "w-full h-full",
      containerClassName
    )}>
      {/* Skeleton de carga */}
      {isLoading && !priority && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={defaultSizes}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        placeholder={shouldShowPlaceholder ? 'blur' : 'empty'}
        blurDataURL={shouldShowPlaceholder ? DEFAULT_BLUR_DATA_URL : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          fill && "object-cover",
          className
        )}
        {...props}
      />
    </div>
  )
}

/**
 * BackgroundImage - Componente para imagenes de fondo optimizadas
 */
interface BackgroundImageProps {
  src: string
  alt: string
  children?: React.ReactNode
  className?: string
  overlayClassName?: string
  priority?: boolean
}

export function BackgroundImage({
  src,
  alt,
  children,
  className,
  overlayClassName,
  priority = false
}: BackgroundImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="100vw"
      />
      {overlayClassName && (
        <div className={cn("absolute inset-0", overlayClassName)} />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

/**
 * AvatarImage - Componente optimizado para avatares
 */
interface AvatarImageProps {
  src?: string | null
  alt: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const AVATAR_SIZES = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80
}

export function AvatarImage({
  src,
  alt,
  fallback,
  size = 'md',
  className
}: AvatarImageProps) {
  const dimension = AVATAR_SIZES[size]

  if (!src) {
    return (
      <div
        className={cn(
          "rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium",
          className
        )}
        style={{ width: dimension, height: dimension }}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      className={cn("rounded-full object-cover", className)}
      containerClassName="rounded-full"
      fallbackSrc="/placeholder-avatar.png"
    />
  )
}

/**
 * GalleryImage - Componente optimizado para galerias de imagenes
 */
interface GalleryImageProps {
  src: string
  alt: string
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/2'
  className?: string
  onClick?: () => void
  priority?: boolean
}

const ASPECT_RATIOS = {
  'square': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-video',
  '3/2': 'aspect-[3/2]'
}

export function GalleryImage({
  src,
  alt,
  aspectRatio = '4/3',
  className,
  onClick,
  priority = false
}: GalleryImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg cursor-pointer group",
        ASPECT_RATIOS[aspectRatio],
        className
      )}
      onClick={onClick}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
    </div>
  )
}
