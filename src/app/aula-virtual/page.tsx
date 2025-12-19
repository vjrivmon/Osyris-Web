'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  FileCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  RefreshCw,
  Users,
  Bell,
  Unlock,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { useDashboardScouter } from "@/hooks/useDashboardScouter"
import { ProximoSabadoCard } from "@/components/aula-virtual/proximo-sabado-card"
import { ProximoCampamentoCard } from "@/components/aula-virtual/proximo-campamento-card"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function AulaVirtualDashboard() {
  const {
    data,
    proximoSabado,
    proximoCampamento,
    actividadReciente,
    documentosPendientes,
    seccionNombre,
    loading,
    error,
    sabadoExpanded,
    campamentoExpanded,
    toggleSabadoExpanded,
    toggleCampamentoExpanded,
    refresh,
    limpiarNotificaciones
  } = useDashboardScouter()

  // Funcion para obtener icono segun tipo
  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case 'documento_pendiente':
      case 'documento_campamento':
        return <FileCheck className="h-5 w-5 text-amber-500" />
      case 'documento_aprobado':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'documento_rechazado':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'confirmacion_sabado':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelacion_sabado':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'inscripcion_campamento':
        return <Users className="h-5 w-5 text-emerald-500" />
      case 'cancelacion_campamento':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'pago_campamento':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'solicitud_desbloqueo':
        return <Unlock className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  // Funcion para obtener color de badge por prioridad
  const getPrioridadVariant = (prioridad: string): "destructive" | "secondary" | "outline" => {
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
    <div className="space-y-6">
      {/* Header con titulo y seccion */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Panel de Control</h1>
            {seccionNombre && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {seccionNombre}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {seccionNombre
              ? `Vista general del estado de ${seccionNombre}`
              : 'Vista general del estado de tu seccion'
            }
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Error alert */}
      {error && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Error cargando datos</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de documentos pendientes */}
      {documentosPendientes.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <FileCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">
                    {documentosPendientes.length} documento{documentosPendientes.length > 1 ? 's' : ''} pendiente{documentosPendientes.length > 1 ? 's' : ''} de revision
                  </p>
                  <p className="text-sm text-amber-600">
                    Las familias estan esperando tu confirmacion
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 self-start sm:self-auto">
                <Link href="/aula-virtual/documentos-pendientes">
                  Revisar ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid principal: Columna izquierda (tarjetas) + Columna derecha (actividad) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Columna izquierda - Tarjetas apiladas verticalmente */}
        <div className="lg:col-span-2 space-y-6">
          <ProximoSabadoCard
            data={proximoSabado}
            expanded={sabadoExpanded}
            onToggleExpand={toggleSabadoExpanded}
            loading={loading}
          />

          <ProximoCampamentoCard
            data={proximoCampamento}
            expanded={campamentoExpanded}
            onToggleExpand={toggleCampamentoExpanded}
            loading={loading}
          />
        </div>

        {/* Columna derecha - Actividad Reciente con mas espacio */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    Actividad Reciente
                    {actividadReciente.filter(n => !n.leida).length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {actividadReciente.filter(n => !n.leida).length} nueva{actividadReciente.filter(n => !n.leida).length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Ultimas interacciones de las familias</CardDescription>
                </div>
                {actividadReciente.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await limpiarNotificaciones()
                      } catch {
                        console.error('Error limpiando notificaciones')
                      }
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    title="Limpiar todas las notificaciones"
                  >
                    <Trash2 className="h-4 w-4" />
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
              ) : actividadReciente.length === 0 ? (
                <div className="text-center space-y-4 py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">No hay actividad reciente</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Cuando las familias confirmen asistencia, se inscriban a campamentos
                      o suban documentos, las notificaciones apareceran aqui.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {actividadReciente.slice(0, 15).map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
                        notif.leida
                          ? 'bg-white dark:bg-card border-gray-100 dark:border-gray-800'
                          : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getIconForTipo(notif.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-sm">{notif.titulo}</p>
                          <Badge variant={getPrioridadVariant(notif.prioridad)} className="text-xs">
                            {notif.prioridad}
                          </Badge>
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
                      {notif.enlace_accion && (
                        <div className="flex-shrink-0">
                          <Button asChild variant="outline" size="sm">
                            <Link href={notif.enlace_accion}>
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
