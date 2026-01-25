"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { List } from "lucide-react"

export interface TocItem {
  id: string
  title: string
  icon?: React.ReactNode
}

interface TableOfContentsProps {
  items: TocItem[]
  className?: string
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    )

    // Observar todas las secciones
    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // Offset para el header sticky
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <nav
      className={cn("space-y-1", className)}
      aria-label="Tabla de contenidos"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
        <List className="h-4 w-4" />
        Contenidos
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleClick(item.id)}
              className={cn(
                "w-full text-left text-sm py-2 px-3 rounded-md transition-all duration-200",
                "hover:bg-muted hover:text-foreground",
                activeId === item.id
                  ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                  : "text-muted-foreground border-l-2 border-transparent"
              )}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.title}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
