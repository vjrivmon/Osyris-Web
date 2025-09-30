"use client"

import { useState, useEffect, useRef, ImgHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string
  placeholderSrc?: string
  srcSet?: string
  fallbackSrc?: string
  aspectRatio?: number | string
  className?: string
  imgClassName?: string
  placeholderClassName?: string
  loadingIndicator?: React.ReactNode
  fill?: boolean // Flag to indicate image should fill container
  onLoad?(): void
  onError?(): void
}

/**
 * LazyImage - Componente para cargar imágenes de manera optimizada
 * 
 * Características:
 * - Lazy loading nativo
 * - Soporte para placeholders mientras carga
 * - Fallback en caso de error
 * - Animación de carga suave
 * - Soporte para aspect ratio
 * - Optimizado para usabilidad móvil
 */
export function LazyImage({
  src,
  placeholderSrc,
  srcSet,
  fallbackSrc,
  aspectRatio = "auto",
  alt = "",
  className,
  imgClassName,
  placeholderClassName,
  loadingIndicator,
  fill,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Manejar la intersección (cuando la imagen entra en el viewport)
  useEffect(() => {
    if (!imgRef.current) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "200px", // Comenzar a cargar 200px antes de que sea visible
        threshold: 0.01
      }
    )
    
    observer.observe(imgRef.current)
    
    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  // Manejar la carga exitosa de la imagen
  const handleLoad = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  // Manejar el error de carga
  const handleError = () => {
    setIsError(true)
    if (onError) onError()
  }

  // Calcular aspect ratio como estilo
  const aspectRatioStyle = typeof aspectRatio === "number"
    ? { paddingBottom: `${(1 / aspectRatio) * 100}%` }
    : { aspectRatio: aspectRatio !== "auto" ? aspectRatio : undefined }

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted", 
        className
      )} 
      style={aspectRatioStyle}
    >
      {/* Placeholder o indicador de carga */}
      {!isLoaded && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted",
          placeholderClassName
        )}>
          {placeholderSrc ? (
            <img 
              src={placeholderSrc} 
              alt={alt} 
              className="w-full h-full object-cover opacity-70 transition-opacity duration-100" 
            />
          ) : loadingIndicator ? (
            loadingIndicator
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-muted to-muted-foreground/10 animate-pulse" />
          )}
        </div>
      )}

      {/* Imagen principal */}
      <img
        ref={imgRef}
        src={isInView ? (isError && fallbackSrc ? fallbackSrc : src) : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} // Imagen transparente 1x1px
        srcSet={isInView && !isError ? srcSet : undefined}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          imgClassName
        )}
        {...props}
      />
    </div>
  )
} 