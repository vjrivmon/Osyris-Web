"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LazyImage } from "@/components/ui/lazy-image"
import { ChevronLeft, ChevronRight, X, Search, Download, Share, Loader2 } from "lucide-react"

// Componente para la galería
export default function GaleriaPage() {
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null)
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [lightboxLoading, setLightboxLoading] = useState(false)

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
      // Siguiente imagen en el mismo álbum
      setSelectedImage(currentAlbum.photos[currentIndex + 1])
    } else if (currentAlbumIndex < photoAlbums.length - 1) {
      // Primera imagen del siguiente álbum
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
      // Imagen anterior en el mismo álbum
      setSelectedImage(currentAlbum.photos[currentIndex - 1])
    } else if (currentAlbumIndex > 0) {
      // Última imagen del álbum anterior
      const prevAlbum = photoAlbums[currentAlbumIndex - 1]
      setCurrentAlbumIndex(currentAlbumIndex - 1)
      setSelectedImage(prevAlbum.photos[prevAlbum.photos.length - 1])
    }
  }

  // Filtrar álbumes en base a la búsqueda
  const filteredAlbums = photoAlbums.map(album => ({
    ...album,
    photos: album.photos.filter(photo => 
      photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(album => album.photos.length > 0)

  // Función para generar un placeholder de baja resolución
  const generatePlaceholder = (url: string) => {
    // En producción, esto sería una versión de baja resolución real
    // Para este ejemplo, solo devolvemos la misma URL
    return url;
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
        <section className="relative bg-primary py-16">
          <div className="container mx-auto px-4 text-center text-primary-foreground">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              Galería de Fotos
            </h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">
              Explora los mejores momentos del Grupo Scout Osyris
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar fotos, actividades, etiquetas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-shrink-0">
                <Tabs defaultValue="todos" className="w-full">
                  <TabsList className="grid grid-cols-3 sm:grid-cols-5 h-9">
                    <TabsTrigger value="todos" className="text-xs">Todos</TabsTrigger>
                    <TabsTrigger value="campamentos" className="text-xs">Campamentos</TabsTrigger>
                    <TabsTrigger value="actividades" className="text-xs">Actividades</TabsTrigger>
                    <TabsTrigger value="secciones" className="text-xs">Secciones</TabsTrigger>
                    <TabsTrigger value="eventos" className="text-xs">Eventos</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredAlbums.length > 0 ? (
              <div className="space-y-12">
                {filteredAlbums.map((album, albumIndex) => (
                  <div key={album.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">{album.title}</h2>
                      <Badge variant="outline">{album.photos.length} fotos</Badge>
                    </div>
                    <p className="text-muted-foreground">{album.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {album.photos.map((photo) => (
                        <Card key={photo.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow border">
                          <div 
                            className="relative aspect-[4/3] overflow-hidden bg-muted"
                            onClick={() => openLightbox(photo, albumIndex)}
                          >
                            <LazyImage
                              src={photo.thumbnail || photo.src}
                              placeholderSrc={generatePlaceholder(photo.thumbnail || photo.src)}
                              alt={photo.title}
                              aspectRatio={4/3}
                              className="w-full h-full"
                              imgClassName="transition-transform duration-300 group-hover:scale-105"
                              loadingIndicator={
                                <div className="flex items-center justify-center w-full h-full bg-muted">
                                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                              }
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white font-medium">Ver foto</span>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium truncate">{photo.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">{photo.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No se encontraron resultados para "{searchTerm}"</p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                  Mostrar todas las fotos
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90 text-white border-none">
          <div className="relative h-[80vh] flex flex-col">
            {/* Controles superiores */}
            <div className="flex justify-between items-center p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
              <DialogTitle className="text-lg font-medium text-white">
                {selectedImage?.title}
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Share className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Imagen principal */}
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
              {selectedImage && (
                <LazyImage
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="max-h-full max-w-full"
                  imgClassName="object-contain"
                  onLoad={() => setLightboxLoading(false)}
                  loadingIndicator={
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  }
                />
              )}
            </div>

            {/* Controles de navegación */}
            <div className="absolute left-0 top-1/2 bottom-1/2 flex items-center justify-start p-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={prevImage}
                disabled={lightboxLoading}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            </div>
            <div className="absolute right-0 top-1/2 bottom-1/2 flex items-center justify-end p-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={nextImage}
                disabled={lightboxLoading}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>

            {/* Descripción e información */}
            <div className="p-4 absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent">
              <DialogDescription className="text-gray-300">
                {selectedImage?.description}
              </DialogDescription>
              <div className="flex mt-2 gap-2 flex-wrap">
                {selectedImage?.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-white/10 text-white hover:bg-white/20">
                    {tag}
                  </Badge>
                ))}
                <Badge variant="outline" className="bg-primary/20 text-primary-foreground">
                  {selectedImage?.date}
                </Badge>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  )
}

// Tipos para la galería
interface Photo {
  id: string
  title: string
  description: string
  src: string
  thumbnail?: string
  tags: string[]
  date: string
}

interface PhotoAlbum {
  id: string
  title: string
  description: string
  cover: string
  date: string
  photos: Photo[]
}

// Datos de ejemplo para la galería
const photoAlbums: PhotoAlbum[] = [
  {
    id: "campamento-verano-2024",
    title: "Campamento de Verano 2024",
    description: "Dos semanas de aventuras en Sierra de Gredos",
    cover: "/images/galeria/campamento-verano-1.jpg",
    date: "Julio 2024",
    photos: [
      {
        id: "cv1",
        title: "Montaje de campamento",
        description: "Primer día montando las tiendas en la zona de acampada",
        src: "/images/galeria/campamento-verano-1.jpg",
        tags: ["Campamento", "Verano", "Grupo"],
        date: "15/07/2024"
      },
      {
        id: "cv2",
        title: "Ascensión al pico Almanzor",
        description: "Rutas en su ascensión al pico más alto de la Sierra de Gredos",
        src: "/images/galeria/campamento-verano-2.jpg",
        tags: ["Campamento", "Rutas", "Montaña"],
        date: "20/07/2024"
      },
      {
        id: "cv3",
        title: "Taller de cocina solar",
        description: "Manada y Tropa aprendiendo sobre energía solar con cocinas solares",
        src: "/images/galeria/campamento-verano-3.jpg",
        tags: ["Campamento", "Manada", "Tropa", "Talleres"],
        date: "18/07/2024"
      },
      {
        id: "cv4",
        title: "Noche de estrellas",
        description: "Observación astronómica con todas las secciones",
        src: "/images/galeria/campamento-verano-4.jpg",
        tags: ["Campamento", "Grupo", "Noche"],
        date: "22/07/2024"
      }
    ]
  },
  {
    id: "festival-navidad-2023",
    title: "Festival de Navidad 2023",
    description: "Celebración navideña con todas las secciones y familias",
    cover: "/images/galeria/navidad-1.jpg",
    date: "Diciembre 2023",
    photos: [
      {
        id: "n1",
        title: "Representación de Castores",
        description: "Los castores representaron un cuento navideño tradicional",
        src: "/images/galeria/navidad-1.jpg",
        tags: ["Navidad", "Castores", "Festival"],
        date: "18/12/2023"
      },
      {
        id: "n2",
        title: "Coro del grupo",
        description: "Actuación del coro con villancicos internacionales",
        src: "/images/galeria/navidad-2.jpg",
        tags: ["Navidad", "Grupo", "Música"],
        date: "18/12/2023"
      },
      {
        id: "n3",
        title: "Decoración del local",
        description: "El local decorado por todas las secciones para la ocasión",
        src: "/images/galeria/navidad-3.jpg",
        tags: ["Navidad", "Local", "Decoración"],
        date: "15/12/2023"
      }
    ]
  },
  {
    id: "semana-santa-2024",
    title: "Campamento Semana Santa 2024",
    description: "Campamento en Navalón con actividades de rastreo y naturaleza",
    cover: "/images/galeria/semana-santa-1.jpg",
    date: "Abril 2024",
    photos: [
      {
        id: "ss1",
        title: "Juego de pistas",
        description: "Gran juego de pistas por equipos en el bosque",
        src: "/images/galeria/semana-santa-1.jpg",
        tags: ["Semana Santa", "Juegos", "Grupo"],
        date: "29/03/2024"
      },
      {
        id: "ss2",
        title: "Construcciones pioneros",
        description: "Los pioneros construyeron un puente con técnicas de pionerismo",
        src: "/images/galeria/semana-santa-2.jpg",
        tags: ["Semana Santa", "Pioneros", "Construcción"],
        date: "30/03/2024"
      },
      {
        id: "ss3",
        title: "Taller de naturaleza",
        description: "Identificación de plantas y animales en el entorno natural",
        src: "/images/galeria/semana-santa-3.jpg",
        tags: ["Semana Santa", "Naturaleza", "Talleres"],
        date: "31/03/2024"
      },
      {
        id: "ss4",
        title: "Velada final",
        description: "Velada de despedida con todas las secciones",
        src: "/images/galeria/semana-santa-4.jpg",
        tags: ["Semana Santa", "Velada", "Grupo"],
        date: "01/04/2024"
      },
      {
        id: "ss5",
        title: "Excursión al río",
        description: "Día de excursión al río cercano con actividades acuáticas",
        src: "/images/galeria/semana-santa-5.jpg",
        tags: ["Semana Santa", "Excursión", "Agua"],
        date: "31/03/2024"
      }
    ]
  },
  {
    id: "san-jorge-2024",
    title: "Celebración de San Jorge 2024",
    description: "Encuentro con otros grupos scouts de la provincia",
    cover: "/images/galeria/san-jorge-1.jpg",
    date: "Abril 2024",
    photos: [
      {
        id: "sj1",
        title: "Ceremonia de banderas",
        description: "Ceremonia inicial con todos los grupos participantes",
        src: "/images/galeria/san-jorge-1.jpg",
        tags: ["San Jorge", "Ceremonia", "Grupo"],
        date: "20/04/2024"
      },
      {
        id: "sj2",
        title: "Grandes juegos",
        description: "Actividades lúdicas entre todas las secciones de diferentes grupos",
        src: "/images/galeria/san-jorge-2.jpg",
        tags: ["San Jorge", "Juegos", "Grupo"],
        date: "20/04/2024"
      },
      {
        id: "sj3",
        title: "Comida compartida",
        description: "Gran comida compartida entre todos los participantes",
        src: "/images/galeria/san-jorge-3.jpg",
        tags: ["San Jorge", "Comida", "Grupo"],
        date: "20/04/2024"
      }
    ]
  }
] 