'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Calendar,
  FileText,
  Camera,
  Upload,
  Phone,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  MessageSquare,
  ArrowRight,
  MapPin,
  RefreshCw,
  Home
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useFamiliaData, useDashboardData } from "@/hooks"

interface DashboardHomeProps {
  className?: string
}

export function DashboardHome({ className }: DashboardHomeProps) {
  const { user } = useAuth()
  const { hijos, loading: loadingHijos, refetch: refetchHijos } = useFamiliaData()
  const {
    alertas,
    actividades,
    loading: loadingDashboard,
    refetch: refetchDashboard
  } = useDashboardData()

  const [refreshing, setRefreshing] = useState(false)

  // Función para obtener el nombre a mostrar
  const getNombreMostrar = () => {
    if (!user) return ''

    // Si el nombre parece ser un username de email (sin espacios, sin mayúsculas)
    // entonces extraer el nombre del email y capitalizarlo
    if (user.nombre && !user.nombre.includes(' ') && user.nombre === user.nombre.toLowerCase()) {
      // Extraer nombre del email y capitalizar primera letra
      const nombreEmail = user.email.split('@')[0]
      return nombreEmail.charAt(0).toUpperCase() + nombreEmail.slice(1)
    }

    // Si tiene nombre y apellidos, usarlos
    if (user.nombre && user.apellidos) {
      return `${user.nombre} ${user.apellidos}`
    }

    // Si solo tiene nombre, usarlo
    return user.nombre || user.email.split('@')[0]
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        refetchHijos(),
        refetchDashboard()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const isLoading = loadingHijos || loadingDashboard

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'destructive'
      case 'media': return 'default'
      case 'baja': return 'secondary'
      default: return 'default'
    }
  }

  const getEstadoDocumentosColor = (estado: string) => {
    switch (estado) {
      case 'completo': return 'text-green-600 bg-green-50'
      case 'pendiente': return 'text-yellow-600 bg-yellow-50'
      case 'vencido': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getConfirmacionColor = (confirmacion: string) => {
    switch (confirmacion) {
      case 'confirmado': return 'text-green-600 bg-green-50'
      case 'pendiente': return 'text-yellow-600 bg-yellow-50'
      case 'rechazado': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return <DashboardHomeSkeleton />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con Refresh */}
      <div className="flex items-center justify-between">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
            Hola, {getNombreMostrar()} 👋
          </h1>
          <p className="text-green-100 mb-4">
            Bienvenido al portal de familias del Grupo Scout Osyris
          </p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">
                {hijos?.length || 0} {(hijos?.length || 0) === 1 ? 'hijo vinculado' : 'hijos vinculados'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="ml-4"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Alertas Urgentes */}
      {alertas && alertas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Alertas Importantes</span>
          </h2>
          {alertas.slice(0, 3).map((alerta) => (
            <Alert key={alerta.id} variant={getPrioridadColor(alerta.prioridad) as any}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                {alerta.titulo}
                <Badge variant={getPrioridadColor(alerta.prioridad) as any}>
                  {alerta.prioridad === 'alta' ? 'Urgente' : 
                   alerta.prioridad === 'media' ? 'Importante' : 'Informativo'}
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">{alerta.descripcion}</p>
                {alerta.accion && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={alerta.accion.href}>
                      {alerta.accion.texto}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Hijos Vinculados */}
      {hijos && hijos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tus Hijos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {hijos.map((hijo) => (
              <Card key={hijo.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={hijo.foto} alt={hijo.nombre} />
                      <AvatarFallback className="text-lg font-semibold bg-green-100 text-green-700">
                        {hijo.nombre.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{hijo.nombre} {hijo.apellidos}</CardTitle>
                      <CardDescription>{hijo.seccion}</CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-muted-foreground">{hijo.edad} años</span>
                        <Badge 
                          variant="outline" 
                          className={getEstadoDocumentosColor(hijo.documentos_estado)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {hijo.documentos_estado === 'completo' ? 'Documentos al día' : 
                           hijo.documentos_estado === 'pendiente' ? 'Documentos pendientes' : 'Documentos vencidos'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/familia/calendario?seccion=${hijo.seccion}`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Ver Actividades
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/familia/galeria?scout=${hijo.id}`}>
                        <Camera className="h-4 w-4 mr-2" />
                        Ver Fotos
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Próximas Actividades */}
      {actividades && actividades.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Próximas Actividades</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/familia/calendario">
                Ver Todas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {actividades.slice(0, 3).map((actividad) => (
              <Card key={actividad.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{actividad.titulo}</h3>
                        <Badge variant="outline">{actividad.seccion}</Badge>
                        <Badge className={getConfirmacionColor(actividad.confirmacion)}>
                          {actividad.confirmacion === 'confirmado' ? 'Confirmado ✅' :
                           actividad.confirmacion === 'pendiente' ? 'Pendiente ⏰' : 'Rechazado ❌'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(actividad.fecha).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{actividad.hora_inicio}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{actividad.lugar}</span>
                        </div>
                        {actividad.costo && (
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">€{actividad.costo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {actividad.confirmacion === 'pendiente' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Sí
                          </Button>
                          <Button size="sm" variant="outline">
                            No
                          </Button>
                        </>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/familia/calendario?actividad=${actividad.id}`}>
                          Ver Detalles
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estado Vacío */}
      {!hijos?.length && !alertas?.length && !actividades?.length && (
        <Card className="text-center py-12">
          <CardContent>
            <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Bienvenido al Portal de Familias</h3>
            <p className="text-muted-foreground mb-6">
              Todavía no tienes información disponible. Pronto verás aquí las actividades, 
              documentos y comunicaciones de tus hijos.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild>
                <Link href="/contacto">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar Soporte
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/familia/perfil">
                  Actualizar Perfil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DashboardHomeSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg p-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-4" />
        <div className="flex space-x-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* Alertas Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      {/* Hijos Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}