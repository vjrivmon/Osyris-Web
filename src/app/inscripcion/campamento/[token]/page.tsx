'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getApiUrl } from '@/lib/api-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tent,
  Calendar,
  MapPin,
  Euro,
  Loader2,
  AlertCircle,
  LogIn,
  ArrowRight,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

interface ActividadEnlace {
  id: number
  titulo: string
  fecha_inicio: string
  fecha_fin?: string
  tipo: string
  seccion_id?: number
  seccion_nombre?: string
  requiere_inscripcion: boolean
  estado: string
  lugar?: string
  precio?: number
  cancelado: boolean
}

export default function InscripcionCampamentoPage() {
  const params = useParams()
  const router = useRouter()
  const { user, authReady } = useAuth()
  const token = params.token as string

  const [actividad, setActividad] = useState<ActividadEnlace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Resolver el token para obtener datos de la actividad
  useEffect(() => {
    const resolverEnlace = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${getApiUrl()}/api/actividades/enlace/${token}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setActividad(data.data)
        } else if (response.status === 404) {
          setError('Este enlace de inscripcion no es valido o ha expirado.')
        } else if (response.status === 410) {
          setError('Esta actividad ha sido cancelada.')
        } else {
          setError(data.message || 'Error al resolver el enlace.')
        }
      } catch {
        setError('No se pudo conectar al servidor. Intentalo de nuevo mas tarde.')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      resolverEnlace()
    }
  }, [token])

  // Redirigir segun el estado de autenticacion
  useEffect(() => {
    if (!authReady || loading || error || !actividad) return

    // Si no esta logueado, redirigir a login con redirect
    if (!user) {
      router.push(`/login?redirect=/inscripcion/campamento/${token}`)
      return
    }

    // Si es familia, redirigir al wizard de inscripcion del campamento
    if (user.rol === 'familia') {
      router.push(`/familia/campamento/${actividad.id}/inscripcion`)
      return
    }
  }, [authReady, user, actividad, loading, error, token, router])

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
            <p className="text-muted-foreground">Cargando informacion del campamento...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-red-100 w-fit">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>Enlace no valido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild variant="outline">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Actividad cargada pero esperando auth
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
            <p className="text-muted-foreground">Verificando sesion...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Usuario logueado pero no es familia (kraal, admin, etc.)
  if (user && user.rol !== 'familia') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 w-fit">
              <Tent className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>{actividad?.titulo}</CardTitle>
            <CardDescription>
              Este enlace es para que las familias inscriban a sus hijos al campamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Estas logueado como <strong>{user.rol}</strong>. Este enlace es solo para familias.
                Si eres una familia, cierra sesion e inicia sesion con tu cuenta de familia.
              </AlertDescription>
            </Alert>

            {actividad && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatFecha(actividad.fecha_inicio)}</span>
                  {actividad.fecha_fin && <span>- {formatFecha(actividad.fecha_fin)}</span>}
                </div>
                {actividad.lugar && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{actividad.lugar}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">Volver al inicio</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/aula-virtual">Ir al panel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Usuario no logueado - mostrando info antes de redirigir a login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-emerald-100 w-fit">
            <Tent className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle>{actividad?.titulo}</CardTitle>
          <CardDescription>
            Inscripcion al campamento del Grupo Scout Osyris
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actividad && (
            <>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatFecha(actividad.fecha_inicio)}</span>
                  {actividad.fecha_fin && <span>- {formatFecha(actividad.fecha_fin)}</span>}
                </div>
                {actividad.lugar && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{actividad.lugar}</span>
                  </div>
                )}
                {actividad.precio && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Euro className="h-4 w-4" />
                    <span>{actividad.precio} EUR</span>
                  </div>
                )}
                {actividad.seccion_nombre && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {actividad.seccion_nombre}
                  </Badge>
                )}
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Inicia sesion para inscribir a tus hijos en este campamento.
                </p>
                <Button asChild className="w-full gap-2">
                  <Link href={`/login?redirect=/inscripcion/campamento/${token}`}>
                    <LogIn className="h-4 w-4" />
                    Iniciar sesion para inscribirse
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
