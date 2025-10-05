"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Edit } from "lucide-react"
import Link from "next/link"
import { apiEndpoint } from "@/lib/api-utils"

interface Pagina {
  id: number
  titulo: string
  slug: string
  contenido: string
  resumen?: string
  meta_descripcion?: string
  imagen_destacada?: string
  estado: 'borrador' | 'publicada' | 'archivada'
  tipo: 'pagina' | 'articulo' | 'noticia'
  orden_menu: number
  mostrar_en_menu: boolean
  permite_comentarios: boolean
  creado_por: number
  fecha_creacion: string
  fecha_actualizacion: string
  fecha_publicacion?: string
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default function PageBySlug({ params }: PageProps) {
  const [page, setPage] = useState<Pagina | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [slug, setSlug] = useState<string | null>(null)

  useEffect(() => {
    // Unwrap params promise
    params.then(p => {
      setSlug(p.slug)
    })
  }, [params])

  useEffect(() => {
    if (!slug) return

    // Verificar rol del usuario
    const userData = localStorage.getItem('osyris_user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.rol)
    }

    loadPage()
  }, [slug])

  const loadPage = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!slug) return

      const url = apiEndpoint(`/api/paginas/slug/${slug}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          notFound()
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        const pageData = data.data
        // Solo mostrar páginas publicadas (excepto para admins)
        if (pageData.estado !== 'publicada' && userRole !== 'admin') {
          notFound()
        }
        setPage(pageData)
      } else {
        throw new Error(data.message || 'Error al cargar la página')
      }
    } catch (error) {
      console.error('Error al cargar página:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const renderMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mb-6 text-red-900 dark:text-red-100">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-semibold mb-4 text-red-800 dark:text-red-200">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-medium mb-3 text-red-700 dark:text-red-300">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-red-900 dark:text-red-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gm, '<li class="mb-2">$1</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-red-500 pl-4 italic text-muted-foreground bg-red-50 dark:bg-red-950 p-4 rounded-r-lg my-6">$1</blockquote>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l|b])(.+)$/gm, '<p class="mb-4">$1</p>')
      .replace(/<li>/g, '<ul class="list-disc list-inside space-y-2 mb-6 pl-4"><li>')
      .replace(/<\/li>(?=(?:(?!<li>).)*$)/g, '</li></ul>')
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return 'Fecha no válida'
    }
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'publicada':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Publicada
          </Badge>
        )
      case 'archivada':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
            Archivada
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
            Borrador
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error al cargar la página</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!page) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>

              {userRole === 'admin' && (
                <div className="flex items-center gap-2">
                  {getStatusBadge(page.estado)}
                  <Link href={`/admin/pages`}>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar página
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold text-red-900 dark:text-red-100 mb-4">
              {page.titulo}
            </h1>

            {page.resumen && (
              <p className="text-xl text-muted-foreground mb-6">
                {page.resumen}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Actualizado el {formatDate(page.fecha_actualizacion)}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Autor ID: {page.creado_por}
              </span>
            </div>
          </div>

          {/* Content */}
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-8">
              <div
                className="prose prose-lg max-w-none prose-red"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(page.contenido) }}
              />
            </CardContent>
          </Card>

          {/* Footer actions for admins */}
          {userRole === 'admin' && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-red-700 dark:text-red-400">
                  <strong>Panel de administrador:</strong> Puedes editar esta página desde el CMS
                </div>
                <Link href={`/admin/pages`}>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Ir al editor
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}