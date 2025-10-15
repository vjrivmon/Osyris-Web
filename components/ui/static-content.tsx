"use client"

/**
 * Componentes estáticos para reemplazar los componentes editables
 * Estos componentes renderizan contenido sin funcionalidad de edición
 */

import React from "react"
import Image from "next/image"

interface StaticTextProps {
  contentId: string
  content?: string
  className?: string
  fallback?: string
  tag?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span"
}

export function StaticText({
  content,
  className = "",
  fallback = "",
  tag = "p"
}: StaticTextProps) {
  const displayContent = content || fallback

  const Tag = tag as keyof JSX.IntrinsicElements

  return <Tag className={className}>{displayContent}</Tag>
}

interface StaticImageProps {
  contentId: string
  src?: string
  alt?: string
  className?: string
  fallback?: string
  width?: number
  height?: number
  priority?: boolean
}

export function StaticImage({
  src,
  alt = "",
  className = "",
  fallback = "/placeholder.jpg",
  width,
  height,
  priority = false
}: StaticImageProps) {
  const imageSrc = src || fallback

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

interface StaticListProps {
  contentId: string
  items?: Array<{
    text: string
    subtext?: string
  }>
  className?: string
  fallback?: Array<{
    text: string
    subtext?: string
  }>
}

export function StaticList({
  items,
  className = "",
  fallback = []
}: StaticListProps) {
  const displayItems = items || fallback

  if (!displayItems.length) {
    return <ul className={className}></ul>
  }

  return (
    <ul className={className}>
      {displayItems.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <div>
            <div>{item.text}</div>
            {item.subtext && (
              <div className="text-sm text-muted-foreground">{item.subtext}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}