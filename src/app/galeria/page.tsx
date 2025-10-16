"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StaticText } from "@/components/ui/static-content"
import { useSectionContent } from "@/hooks/useSectionContent"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LazyImage } from "@/components/ui/lazy-image"
import { ChevronLeft, ChevronRight, X, Search, Download, Share, Loader2 } from "lucide-react"

interface Photo {
  id: string
  src: string
  alt: string
  title: string
  category: string
  date: string
  size?: string
}

// Datos de ejemplo para la galería
const photoAlbums = [
  {
    id: "todos",
    title: "Todas las Fotos",
    photos: [
      { id: "1", src: "/placeholder.svg?height=300&width=400", alt: "Campamento de verano", title: "Campamento de Verano 2024", category: "campamentos", date: "2024-07-15", size: "1.2 MB" },
      { id: "2", src: "/placeholder.svg?height=300&width=400", alt: "Actividad de tropa", title: "Actividad Tropa Brownsea", category: "actividades", date: "2024-06-20", size: "950 KB" },
      { id: "3", src: "/placeholder.svg?height=300&width=400", alt: "Castores jugando", title: "Juegos de Castores", category: "secciones", date: "2024-05-10", size: "800 KB" },
      { id: "4", src: "/placeholder.svg?height=300&width=400", alt: "Evento especial", title: "Día del Pensamiento", category: "eventos", date: "2024-02-22", size: "1.1 MB" },
      { id: "5", src: "/placeholder.svg?height=300&width=400", alt: "Acampada", title: "Acampada Pioneros", category: "campamentos", date: "2024-04-12", size: "1.0 MB" },
      { id: "6", src: "/placeholder.svg?height=300&width=400", alt: "Manualidades", title: "Taller de Manualidades", category: "actividades", date: "2024-03-08", size: "750 KB" }
    ]
  },
  {
    id: "campamentos",
    title: "Campamentos",
    photos: [
      { id: "1", src: "/placeholder.svg?height=300&width=400", alt: "Campamento de verano", title: "Campamento de Verano 2024", category: "campamentos", date: "2024-07-15", size: "1.2 MB" },
      { id: "5", src: "/placeholder.svg?height=300&width=400", alt: "Acampada", title: "Acampada Pioneros", category: "campamentos", date: "2024-04-12", size: "1.0 MB" }
    ]
  },
  {
    id: "actividades",
    title: "Actividades",
    photos: [
      { id: "2", src: "/placeholder.svg?height=300&width=400", alt: "Actividad de tropa", title: "Actividad Tropa Brownsea", category: "actividades", date: "2024-06-20", size: "950 KB" },
      { id: "6", src: "/placeholder.svg?height=300&width=400", alt: "Manualidades", title: "Taller de Manualidades", category: "actividades", date: "2024-03-08", size: "750 KB" }
    ]
  },
  {
    id: "secciones",
    title: "Secciones",
    photos: [
      { id: "3", src: "/placeholder.svg?height=300&width=400", alt: "Castores jugando", title: "Juegos de Castores", category: "secciones", date: "2024-05-10", size: "800 KB" }
    ]
  },
  {
    id: "eventos",
    title: "Eventos",
    photos: [
      { id: "4", src: "/placeholder.svg?height=300&width=400", alt: "Evento especial", title: "Día del Pensamiento", category: "eventos", date: "2024-02-22", size: "1.1 MB" }
    ]
  }
]

// Componente para la galería
export default function GaleriaPage() {
  // Cargar contenido desde la API
  const { content, isLoading } = useSectionContent('galeria')

  // Función helper para obtener contenido con fallback
  const getContent = (key: string, fallback: string) => {
    return content[key]?.contenido || fallback
  }

  const [selectedImage, setSelectedImage] = useState<Photo | null>(null)
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [lightboxLoading, setLightboxLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("todos")

  // Función para abrir el lightbox
  const openLightbox = (photo: Photo, albumIndex: number) => {
    setSelectedImage(photo)
    setCurrentAlbumIndex(albumIndex)
    setIsDialogOpen(true)
    setLightboxLoading(true)
  }

  // Función para navegar a la siguiente foto
  const nextImage = () => {
    if (!selectedImage) return
    setLightboxLoading(true)

    const currentAlbum = photoAlbums[currentAlbumIndex]
    const currentIndex = currentAlbum.photos.findIndex(photo => photo.id === selectedImage.id)

    if (currentIndex < currentAlbum.photos.length - 1) {
      setSelectedImage(currentAlbum.photos[currentIndex + 1])
    } else if (currentAlbumIndex < photoAlbums.length - 1) {
      setCurrentAlbumIndex(currentAlbumIndex + 1)
      setSelectedImage(photoAlbums[currentAlbumIndex + 1].photos[0])
    }
  }

  // Función para navegar a la foto anterior
  const prevImage = () => {
    if (!selectedImage) return
    setLightboxLoading(true)

    const currentAlbum = photoAlbums[currentAlbumIndex]
    const currentIndex = currentAlbum.photos.findIndex(photo => photo.id === selectedImage.id)

    if (currentIndex > 0) {
      setSelectedImage(currentAlbum.photos[currentIndex - 1])
    } else if (currentAlbumIndex > 0) {
      setCurrentAlbumIndex(currentAlbumIndex - 1)
      const prevAlbum = photoAlbums[currentAlbumIndex - 1]
      setSelectedImage(prevAlbum.photos[prevAlbum.photos.length - 1])
    }
  }

  // Filtrar fotos por búsqueda
  const filterPhotos = (photos: Photo[]) => {
    if (!searchTerm) return photos
    return photos.filter(photo =>
      photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.alt.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary/80 py-16 md:py-24 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <StaticText
              contentId={300}
              identificador="hero-title"
              seccion="galeria"
              as="h1"
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6"
            >
              {getContent('hero-title', 'Galería de Fotos')}
            </StaticText>
            <StaticText
              contentId={301}
              identificador="hero-subtitle"
              seccion="galeria"
              as="p"
              multiline
              className="mt-4 text-xl max-w-3xl mx-auto"
            >
              {getContent('hero-subtitle', 'Revive nuestras aventuras y momentos especiales')}
            </StaticText>
          </div>
        </section>

          {/* Search Section */}
          <section className="py-8 bg-muted/50">
            <div className="container mx-auto px-4">
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder={getContent('search-placeholder', 'Buscar fotos...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Gallery Tabs */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <div className="flex justify-center">
                  <TabsList className="grid w-full max-w-2xl grid-cols-5">
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="campamentos">Campamentos</TabsTrigger>
                    <TabsTrigger value="actividades">Actividades</TabsTrigger>
                    <TabsTrigger value="secciones">Secciones</TabsTrigger>
                    <TabsTrigger value="eventos">Eventos</TabsTrigger>
                  </TabsList>
                </div>

                {photoAlbums.map((album, albumIndex) => (
                  <TabsContent key={album.id} value={album.id} className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">{album.title}</h2>
                      <p className="text-muted-foreground">
                        {filterPhotos(album.photos).length} fotos
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filterPhotos(album.photos).map((photo) => (
                        <Card
                          key={photo.id}
                          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openLightbox(photo, albumIndex)}
                        >
                          <CardContent className="p-0">
                            <div className="aspect-[4/3] relative">
                              <LazyImage
                                src={photo.src}
                                alt={photo.alt}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-sm truncate mb-2">{photo.title}</h3>
                              <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>{photo.date}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {photo.category}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {filterPhotos(album.photos).length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No se encontraron fotos que coincidan con tu búsqueda.</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </section>

          {/* Lightbox Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
              {selectedImage && (
                <>
                  <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{selectedImage.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-4">
                      <span>{selectedImage.date}</span>
                      <Badge variant="secondary">{selectedImage.category}</Badge>
                      <span className="text-xs">{selectedImage.size}</span>
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 relative">
                    {lightboxLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    )}

                    <img
                      src={selectedImage.src}
                      alt={selectedImage.alt}
                      className="w-full h-full object-contain"
                      onLoad={() => setLightboxLoading(false)}
                    />

                    {/* Navigation Buttons */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 pt-0 flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Compartir
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cerrar
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </main>

      <SiteFooter />
    </div>
  )
}