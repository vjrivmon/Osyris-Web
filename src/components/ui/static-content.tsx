"use client"

/**
 * Componentes estáticos para reemplazar los componentes editables
 * Estos componentes renderizan contenido sin funcionalidad de edición
 */

import React from "react"
import Image from "next/image"

interface StaticTextProps {
  contentId?: string | number
  identificador?: string
  seccion?: string
  content?: string
  className?: string
  fallback?: string
  tag?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span"
  as?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span"
  children?: React.ReactNode
}

export function StaticText({
  content,
  className = "",
  fallback = "",
  tag,
  as,
  children
}: StaticTextProps) {
  // Usar children si está disponible, sino content, sino fallback
  const displayContent = children || content || fallback

  // Preferir 'as' sobre 'tag' para compatibilidad
  const Tag = (as || tag || "p") as keyof JSX.IntrinsicElements

  return <Tag className={className}>{displayContent}</Tag>
}

interface StaticImageProps {
  contentId?: string | number
  identificador?: string
  seccion?: string
  src?: string
  alt?: string
  className?: string
  fallback?: string
  width?: number
  height?: number
  priority?: boolean
  children?: React.ReactNode
}

export function StaticImage({
  src,
  alt = "",
  className = "",
  fallback = "/placeholder.jpg",
  width,
  height,
  priority = false,
  children
}: StaticImageProps) {
  // Si hay children, usar el src del children si es string
  const imageSrc = src || (typeof children === 'string' ? children : null) || fallback

  if (!imageSrc || imageSrc === "/placeholder.jpg") {
    return (
      <div className={`bg-muted flex items-center justify-center text-muted-foreground ${className}`}>
        <span>Sin imagen</span>
      </div>
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={className}
      width={width || 500}
      height={height || 300}
      priority={priority}
    />
  )
}

interface StaticListProps<T = { text: string; subtext?: string }> {
  contentId?: number
  identificador?: string
  seccion?: string
  items?: T[]
  className?: string
  fallback?: T[]
  emptyItem?: T
  addButtonText?: string
  render?: (item: T, index: number) => React.ReactNode
  itemEditor?: (item: T, onChange: (item: T) => void) => React.ReactNode
  children?: React.ReactNode
}

export function StaticList<T = { text: string; subtext?: string }>({
  items,
  className = "",
  fallback = [],
  render,
  children
}: StaticListProps<T>) {
  // Siempre usar fallback (datos estáticos) - NO cargar desde API
  const displayItems = fallback

  if (!displayItems || !displayItems.length) {
    return <ul className={className}></ul>
  }

  // Si hay función render personalizada, usarla
  if (render) {
    return (
      <ul className={className}>
        {displayItems.map((item, index) => (
          <li key={index}>{render(item, index)}</li>
        ))}
      </ul>
    )
  }

  // Renderizado por defecto para items simples con text/subtext
  return (
    <ul className={className}>
      {displayItems.map((item, index) => {
        const typedItem = item as any
        return (
          <li key={index} className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <div>
              <div>{typedItem.text || typedItem.title || typedItem.year || ''}</div>
              {(typedItem.subtext || typedItem.description) && (
                <div className="text-sm text-muted-foreground">
                  {typedItem.subtext || typedItem.description}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}