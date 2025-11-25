'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Calendar,
  MessageSquare,
  ArrowRight,
  Plus,
  FileCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye
} from "lucide-react"
import Link from "next/link"
import { useNotificacionesScouter, NotificacionScouter } from "@/hooks/useNotificacionesScouter"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function AulaVirtualDashboard() {
  const {
    notificaciones,
    documentosPendientes,
    contadorNoLeidas,
    loading,
    marcarComoLeida
  } = useNotificacionesScouter()

  // Función para obtener icono según tipo
  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case 'documento_pendiente':
        return <FileCheck className="h-5 w-5 text-amber-500" />
      case 'documento_aprobado':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'documento_rechazado':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-blue-500" />
    }
  }

  // Función para obtener color de badge por prioridad
  const getPrioridadVariant = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'destructive'
      case 'normal':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido al Aula Virtual</h1>
        <p className="text-muted-foreground text-lg">
          Tu espacio digital para mantenerte conectado con el Grupo Scout Osyris.
        </p>
      </div>

      {/* Alerta de documentos pendientes */}
      {documentosPendientes.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <FileCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">
                    {documentosPendientes.length} documento{documentosPendientes.length > 1 ? 's' : ''} pendiente{documentosPendientes.length > 1 ? 's' : ''} de revisión
                  </p>
                  <p className="text-sm text-amber-600">
                    Las familias están esperando tu confirmación
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                <Link href="/aula-virtual/documentos-pendientes">
                  Revisar ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layout principal: Actividad Reciente (grande) + Quick Actions (sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad Reciente - Ocupa 2 columnas (grande) */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Actividad Reciente
                    {contadorNoLeidas > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {contadorNoLeidas} nueva{contadorNoLeidas > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Notificaciones y tareas pendientes</CardDescription>
                </div>
                {notificaciones.length > 0 && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/aula-virtual/documentos-pendientes">
                      Ver todo
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Cargando actividad...</p>
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="text-center space-y-4 py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">No hay actividad reciente</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Cuando las familias suban documentos o interactúen con el sistema,
                      las notificaciones aparecerán aquí.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {notificaciones.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                        notif.leida
                          ? 'bg-white border-gray-100'
                          : 'bg-amber-50/50 border-amber-200'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getIconForTipo(notif.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{notif.titulo}</p>
                          <Badge variant={getPrioridadVariant(notif.prioridad) as any} className="text-xs">
                            {notif.prioridad}
                          </Badge>
                          {notif.seccion_nombre && (
                            <Badge variant="outline" className="text-xs">
                              {notif.seccion_nombre}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notif.mensaje}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(notif.fecha_creacion), {
                              addSuffix: true,
                              locale: es
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        {!notif.leida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => marcarComoLeida(notif.id)}
                            className="text-xs"
                          >
                            Marcar leída
                          </Button>
                        )}
                        {notif.enlace_accion && (
                          <Button asChild variant="outline" size="sm">
                            <Link href={notif.enlace_accion}>
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar - Ocupa 1 columna (derecha) */}
        <div className="space-y-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Documentos</CardTitle>
                  <CardDescription>Accede a documentos importantes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
                <Link href="/aula-virtual/documentos" >
                  Ver documentos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Calendario</CardTitle>
                  <CardDescription>Consulta actividades y eventos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
                <Link href="/aula-virtual/calendario" >
                  Ver calendario
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Comunicaciones</CardTitle>
                  <CardDescription>Lee mensajes y circulares</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
                <Link href="/aula-virtual/comunicaciones" >
                  Ver comunicaciones
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
