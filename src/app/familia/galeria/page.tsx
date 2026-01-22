'use client'

import Image from 'next/image'
import { useGaleriaFamilia } from '@/hooks/useGaleriaFamilia'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function GaleriaFamiliaPage() {
  const { fotos, loading, error } = useGaleriaFamilia()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando galería...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb - Volver */}
      <Link
        href="/familia/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Galería Privada</h1>
        <p className="text-muted-foreground mt-2">
          Fotos exclusivas donde aparecen tus hijos
        </p>
      </div>

      {!fotos || fotos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Camera className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay fotos disponibles</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Aún no hay fotos de tus hijos en la galería. Las fotos aparecerán aquí cuando los monitores las suban.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fotos.map((foto) => (
            <Card key={foto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative w-full h-48">
                <Image
                  src={foto.url}
                  alt={foto.titulo || 'Foto'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">{foto.titulo}</h3>
                {foto.descripcion && (
                  <p className="text-sm text-muted-foreground mt-1">{foto.descripcion}</p>
                )}
                {foto.fecha_captura && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(foto.fecha_captura).toLocaleDateString('es-ES')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
